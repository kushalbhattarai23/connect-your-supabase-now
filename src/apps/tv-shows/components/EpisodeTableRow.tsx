
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { UniverseEpisode } from '@/hooks/useUniverseEpisodes';
import { useEpisodeStatus } from '@/hooks/useEpisodeStatus';

interface EpisodeTableRowProps {
  episode: UniverseEpisode;
}

export const EpisodeTableRow: React.FC<EpisodeTableRowProps> = ({ episode }) => {
  const { toggleWatchStatus, isUpdating } = useEpisodeStatus();

  const handleWatchToggle = () => {
    toggleWatchStatus({
      episodeId: episode.id,
      currentStatus: episode.watched
    });
  };

  return (
    <TableRow className={episode.watched ? 'bg-green-50/50' : 'bg-gray-50/30'}>
      <TableCell className="font-medium text-blue-600">
        {episode.show?.title || 'Unknown Show'}
      </TableCell>
      <TableCell className="text-center">
        S{episode.season_number}
      </TableCell>
      <TableCell className="text-center">
        {episode.episode_number}
      </TableCell>
      <TableCell className="font-medium">
        {episode.title}
      </TableCell>
      <TableCell className="text-center">
        {episode.air_date ? new Date(episode.air_date).toLocaleDateString() : 'TBA'}
      </TableCell>
      <TableCell className="text-center">
        {episode.watched ? (
          <div className="flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <X className="w-5 h-5 text-red-500" />
          </div>
        )}
      </TableCell>
      <TableCell className="text-center">
        <Button
          size="sm"
          variant={episode.watched ? "outline" : "default"}
          onClick={handleWatchToggle}
          disabled={isUpdating}
          className={episode.watched ? "border-red-200 text-red-600 hover:bg-red-50" : "bg-green-600 hover:bg-green-700"}
        >
          {episode.watched ? 'Mark as Watched' : 'Mark as Watched'}
        </Button>
      </TableCell>
    </TableRow>
  );
};
