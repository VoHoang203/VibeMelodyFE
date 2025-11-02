// UploadedTrackCard.jsx
import PropTypes from "prop-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Trash2 } from "lucide-react";

export function UploadedTrackCard({ track, onRemove }) {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          {track.imageUrl?.includes("placeholder") ? (
            <div className="h-16 w-16 rounded bg-secondary flex items-center justify-center">
              <Music className="h-6 w-6 text-muted-foreground" />
            </div>
          ) : (
            <img
              src={track.imageUrl || "/placeholder.svg"}
              alt={track.name}
              className="h-16 w-16 rounded object-cover"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{track.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground font-mono">
            {formatDuration(track.duration)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(track.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

UploadedTrackCard.propTypes = {
  track: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    artist: PropTypes.string,
    duration: PropTypes.number.isRequired,
    imageUrl: PropTypes.string,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default UploadedTrackCard;
