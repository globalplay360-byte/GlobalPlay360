import type { User } from '@/types';
import FootballPlayerFields from './FootballPlayerFields';
import BasketballPlayerFields from './BasketballPlayerFields';
import FutsalPlayerFields from './FutsalPlayerFields';
import VolleyballPlayerFields from './VolleyballPlayerFields';
import HandballPlayerFields from './HandballPlayerFields';
import WaterpoloPlayerFields from './WaterpoloPlayerFields';
import TennisPlayerFields from './TennisPlayerFields';
import RugbyPlayerFields from './RugbyPlayerFields';
import AmericanFootballPlayerFields from './AmericanFootballPlayerFields';
import HockeyPlayerFields from './HockeyPlayerFields';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

/**
 * Dispatches to the sport-specific fields component based on the user's selected sport.
 * Adding a new sport = 1 new file + 1 case here.
 */
export default function SportSpecificFields(props: Props) {
  switch (props.formData.sport) {
    case 'football': return <FootballPlayerFields {...props} />;
    case 'basketball': return <BasketballPlayerFields {...props} />;
    case 'futsal': return <FutsalPlayerFields {...props} />;
    case 'volleyball': return <VolleyballPlayerFields {...props} />;
    case 'handball': return <HandballPlayerFields {...props} />;
    case 'waterpolo': return <WaterpoloPlayerFields {...props} />;
    case 'tennis': return <TennisPlayerFields {...props} />;
    case 'rugby': return <RugbyPlayerFields {...props} />;
    case 'american_football': return <AmericanFootballPlayerFields {...props} />;
    case 'hockey': return <HockeyPlayerFields {...props} />;
    default: return null;
  }
}
