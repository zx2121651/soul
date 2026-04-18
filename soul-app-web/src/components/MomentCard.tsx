import { motion } from 'framer-motion';
import { Heart, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MomentCardProps {
  id: number;
  type: 'text' | 'image' | string;
  text?: string;
  image?: string;
  initialLikes?: number;
  isLiked?: boolean;
  comments?: number;
  time?: string;
  author?: {
    name: string;
    avatar: string;
  };
}

export default function MomentCard({
  id,
  type,
  text,
  image,
  initialLikes = 0,
  isLiked = false,
  comments = 0,
  time,
}: MomentCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-[#1c1e2b] rounded-2xl overflow-hidden border border-white/5 flex flex-col cursor-pointer transition-all hover:shadow-xl hover:shadow-cyan-500/10 mb-3"
      onClick={() => navigate(`/moment/${id}`)}
    >
      {type === 'image' && image && (
        <div className="relative overflow-hidden bg-gray-800 aspect-[4/5]">
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-3 flex flex-col gap-2">
        {text && (
          <p className="text-gray-200 text-xs line-clamp-4 leading-relaxed font-medium">
            {text}
          </p>
        )}

        <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1">
               <Heart
                 size={14}
                 className={isLiked ? "text-pink-500 fill-pink-500" : "text-gray-500"}
               />
               <span className={`text-[10px] ${isLiked ? "text-pink-500" : "text-gray-500"}`}>
                 {initialLikes}
               </span>
             </div>
             <div className="flex items-center gap-1">
               <MessageSquare size={14} className="text-gray-500" />
               <span className="text-[10px] text-gray-500">{comments}</span>
             </div>
          </div>
          {time && (
            <span className="text-[9px] text-gray-600">
              {new Date(time).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
