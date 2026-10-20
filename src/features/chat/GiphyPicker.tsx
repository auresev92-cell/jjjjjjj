import React, { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useUX } from '../../context/UXContext';

interface GiphyGif {
  id: string;
  title: string;
  url: string; // animated gif
  previewUrl: string;
}

interface GiphyPickerProps {
  onSelectGif: (gifUrl: string, title: string) => void;
  onClose: () => void;
}

const POPULAR_GIF_CATEGORIES = ['Tendances', 'Amour ❤️', 'Bisous 💋', 'Drôle 😂', 'Danse 💃', 'Clin d’œil 😉'];

// Curated high-quality fallback GIFs for fast offline or keyless loading
const FALLBACK_GIFS: GiphyGif[] = [
  {
    id: 'f_1',
    title: 'Love heart reaction',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1eHN3MjkyNXUzeWRsZjdzMmdreDNodmlybmcyNDdtODdmcm8wdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L2N8D7B00K1yA/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1eHN3MjkyNXUzeWRsZjdzMmdreDNodmlybmcyNDdtODdmcm8wdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L2N8D7B00K1yA/giphy.gif',
  },
  {
    id: 'f_2',
    title: 'Cute kiss cat',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejN6ZjI2NHgzeTRwMnRwYmV2dm8yeXQ5cmxweDF0em5pOGpscnJrcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MDJ9IbxxvDUQM/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejN6ZjI2NHgzeTRwMnRwYmV2dm8yeXQ5cmxweDF0em5pOGpscnJrcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MDJ9IbxxvDUQM/giphy.gif',
  },
  {
    id: 'f_3',
    title: 'Happy dance',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGtzaGlucmdsYXp5ZmgxNHRxdTdzbGtpaW9reGNua2kyeG11NDBvOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/blSTtZehjAZ8I/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGtzaGlucmdsYXp5ZmgxNHRxdTdzbGtpaW9reGNua2kyeG11NDBvOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/blSTtZehjAZ8I/giphy.gif',
  },
  {
    id: 'f_4',
    title: 'Flirty wink',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTc5bDVpdmtscGNvNjlsMWc1bnY0NGsydnhvczdtZWpnaHNvZzdrZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6uU73M3p6X34A/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTc5bDVpdmtscGNvNjlsMWc1bnY0NGsydnhvczdtZWpnaHNvZzdrZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6uU73M3p6X34A/giphy.gif',
  },
  {
    id: 'f_5',
    title: 'Sparkle hearts',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2JicGZtbWZpdmt6dmx5MnNpdXFiMmd0NnRwcTF2OTM5enN5c2VxbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26hpKMTa54ASMJ292/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2JicGZtbWZpdmt6dmx5MnNpdXFiMmd0NnRwcTF2OTM5enN5c2VxbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26hpKMTa54ASMJ292/giphy.gif',
  },
  {
    id: 'f_6',
    title: 'Laughing out loud',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXAxbTJnbXRvbnNybWZ6ODF2b2ttandpdnAyeXB6ZDVndWkyNXk2bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/10JhviFuU2gWD6/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXAxbTJnbXRvbnNybWZ6ODF2b2ttandpdnAyeXB6ZDVndWkyNXk2bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/10JhviFuU2gWD6/giphy.gif',
  },
];

export const GiphyPicker: React.FC<GiphyPickerProps> = ({ onSelectGif, onClose }) => {
  const { triggerFeedback } = useUX();
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState<GiphyGif[]>(FALLBACK_GIFS);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGifs = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GIPHY_API_KEY || 'dc6zaTOxFJmzC'; // public beta key
      const endpoint = query.trim()
        ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=18&rating=g`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=18&rating=g`;

      const response = await fetch(endpoint);
      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const parsed = json.data.map((item: any) => ({
            id: item.id,
            title: item.title || 'GIF Giphy',
            url: item.images?.fixed_height?.url || item.images?.original?.url,
            previewUrl: item.images?.fixed_height_small?.url || item.images?.fixed_height?.url,
          }));
          setGifs(parsed);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Giphy API request failed, using fallback GIFs:', e);
    }

    // Filter fallback gifs by query if API request fails
    if (query.trim()) {
      const filtered = FALLBACK_GIFS.filter((g) =>
        g.title.toLowerCase().includes(query.toLowerCase())
      );
      setGifs(filtered.length > 0 ? filtered : FALLBACK_GIFS);
    } else {
      setGifs(FALLBACK_GIFS);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGifs(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchGifs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-3 bg-neutral-900 border-t border-neutral-800 text-white flex flex-col gap-2.5 max-h-[280px] overflow-hidden rounded-t-2xl shadow-2xl"
    >
      {/* Header & Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher des GIFs animés sur Giphy..."
            className="w-full bg-neutral-800 text-white text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 placeholder-neutral-400"
          />
        </div>

        <button
          onClick={() => {
            triggerFeedback('light');
            onClose();
          }}
          className="p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Category Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
        {POPULAR_GIF_CATEGORIES.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => {
              triggerFeedback('light');
              const clean = cat.replace(/[^\w\s]/gi, '').trim();
              setSearchTerm(clean === 'Tendances' ? '' : clean);
            }}
            className="px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-rose-500/20 hover:text-rose-300 text-[10px] font-bold text-neutral-300 shrink-0 border border-neutral-700/50 transition-colors"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GIFs Grid */}
      <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[180px] pr-1 no-scrollbar">
        {isLoading ? (
          <div className="col-span-3 py-8 flex flex-col items-center justify-center text-neutral-400">
            <Loader2 className="w-5 h-5 animate-spin text-rose-500 mb-1" />
            <span className="text-[10px]">Chargement des GIFs...</span>
          </div>
        ) : gifs.length === 0 ? (
          <div className="col-span-3 py-6 text-center text-neutral-400 text-xs">
            Aucun GIF trouvé.
          </div>
        ) : (
          gifs.map((gif) => (
            <div
              key={gif.id}
              onClick={() => {
                triggerFeedback('medium');
                onSelectGif(gif.url, gif.title);
              }}
              className="relative aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 cursor-pointer hover:scale-[1.03] transition-transform active:scale-95"
            >
              <img
                src={gif.previewUrl || gif.url}
                alt={gif.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
