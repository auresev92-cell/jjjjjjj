export interface CallState {
  isActive: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  incomingCall: { from: string; name: string; type: 'voice' | 'video' } | null;
  activeCall: { userId: string; type: 'voice' | 'video' } | null;
  stream: MediaStream | null;
  remoteStream: MediaStream | null;
  status: 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended';
}

export interface CallState {
  isActive: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  incomingCall: { from: string; name: string; type: 'voice' | 'video' } | null;
  activeCall: { userId: string; type: 'voice' | 'video' } | null;
  stream: MediaStream | null;
  remoteStream: MediaStream | null;
  status: 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended';
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

class WebRtcManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private socket: WebSocket | null = null;
  private currentUserId: string = '';
  private targetUserId: string = '';
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onCallStateChangeCallback: ((status: CallState['status']) => void) | null = null;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && !!(window.RTCPeerConnection && navigator.mediaDevices?.getUserMedia);
  }

  public setSocket(ws: WebSocket, userId: string) {
    this.socket = ws;
    this.currentUserId = userId;
  }

  public onRemoteStream(cb: (stream: MediaStream) => void) {
    this.onRemoteStreamCallback = cb;
  }

  public onCallStateChange(cb: (status: CallState['status']) => void) {
    this.onCallStateChangeCallback = cb;
  }

  public async requestPermissions(type: 'voice' | 'video'): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const constraints = {
        audio: true,
        video: type === 'video'
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (e) {
      return false;
    }
  }

  public async getMediaStream(type: 'voice' | 'video'): Promise<MediaStream | null> {
    if (!this.isSupported()) return null;
    try {
      const constraints = {
        audio: true,
        video: type === 'video' ? { facingMode: 'user' } : false
      };
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (e) {
      console.error('Failed to get media stream:', e);
      return null;
    }
  }

  public async startCall(targetUserId: string, type: 'voice' | 'video'): Promise<RTCPeerConnection | null> {
    this.targetUserId = targetUserId;
    this.onCallStateChangeCallback?.('connecting');

    const stream = await this.getMediaStream(type);
    if (!stream) return null;

    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);
    this.remoteStream = new MediaStream();

    stream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, stream);
    });

    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream?.addTrack(track);
      });
      if (this.onRemoteStreamCallback && this.remoteStream) {
        this.onRemoteStreamCallback(this.remoteStream);
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'webrtc_ice_candidate',
          targetUserId,
          candidate: event.candidate
        }));
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      if (state === 'connected') {
        this.onCallStateChangeCallback?.('connected');
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        this.onCallStateChangeCallback?.('ended');
      }
    };

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'webrtc_offer',
        targetUserId,
        offer,
        callType: type
      }));
    }

    return this.peerConnection;
  }

  public async handleIncomingOffer(fromUserId: string, offer: RTCSessionDescriptionInit, type: 'voice' | 'video'): Promise<void> {
    this.targetUserId = fromUserId;
    this.onCallStateChangeCallback?.('connecting');

    const stream = await this.getMediaStream(type);
    if (!stream) return;

    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);
    this.remoteStream = new MediaStream();

    stream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, stream);
    });

    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream?.addTrack(track);
      });
      if (this.onRemoteStreamCallback && this.remoteStream) {
        this.onRemoteStreamCallback(this.remoteStream);
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'webrtc_ice_candidate',
          targetUserId: fromUserId,
          candidate: event.candidate
        }));
      }
    };

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'webrtc_answer',
        targetUserId: fromUserId,
        answer
      }));
    }

    this.onCallStateChangeCallback?.('connected');
  }

  public async handleIncomingAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      this.onCallStateChangeCallback?.('connected');
    }
  }

  public async handleIncomingIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (this.peerConnection) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('Erreur ajout ICE candidate:', err);
      }
    }
  }

  public endCall(): void {
    if (this.socket?.readyState === WebSocket.OPEN && this.targetUserId) {
      this.socket.send(JSON.stringify({
        type: 'webrtc_call_end',
        targetUserId: this.targetUserId
      }));
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStream = null;
    this.targetUserId = '';
    this.onCallStateChangeCallback?.('ended');
  }
}

export const webrtcService = new WebRtcManager();

