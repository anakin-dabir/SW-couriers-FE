import { Input } from '@/components/atoms/input';
import Typography from '@/components/atoms/Typography';

interface AddressCoordinatesInputsProps {
  prefix: string;
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onPatch: (coords: { latitude?: number | null; longitude?: number | null }) => void;
  disabled?: boolean;
  required?: boolean;
  fieldErrors?: Record<string, string>;
}

export default function AddressCoordinatesInputs({
  prefix,
  latitude,
  longitude,
  onPatch,
  disabled = false,
  required = false,
  fieldErrors,
}: AddressCoordinatesInputsProps): React.JSX.Element {
  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      <div className="space-y-1">
        <Typography variant="label" className="text-xs text-gray-500">
          Latitude {required ? <span className="text-red-600">*</span> : null}
        </Typography>
        <Input
          id={`${prefix}-lat`}
          type="number"
          name="latitude"
          min={-90}
          max={90}
          step="any"
          placeholder="e.g. 51.5074"
          value={latitude ?? ''}
          onChange={(e) =>
            onPatch({
              latitude: e.target.value !== '' ? Number(e.target.value) : null,
            })
          }
          disabled={disabled}
          errorMessage={fieldErrors?.latitude}
        />
      </div>
      <div className="space-y-1">
        <Typography variant="label" className="text-xs text-gray-500">
          Longitude {required ? <span className="text-red-600">*</span> : null}
        </Typography>
        <Input
          id={`${prefix}-lng`}
          type="number"
          name="longitude"
          min={-180}
          max={180}
          step="any"
          placeholder="e.g. -0.1278"
          value={longitude ?? ''}
          onChange={(e) =>
            onPatch({
              longitude: e.target.value !== '' ? Number(e.target.value) : null,
            })
          }
          disabled={disabled}
          errorMessage={fieldErrors?.longitude}
        />
      </div>
    </div>
  );
}
