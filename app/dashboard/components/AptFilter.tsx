import TerminalWindow from '../../components/ui/TerminalWindow';

interface AptFilterProps {
  selected: string;
  onChange: (group: string) => void;
}

export default function AptFilter({ selected, onChange }: AptFilterProps) {
  // Common APT groups for filtering
  const aptGroups = [
    { id: 'all', name: 'All Groups' },
    { id: 'APT28', name: 'APT28 (Fancy Bear)' },
    { id: 'APT29', name: 'APT29 (Cozy Bear)' },
    { id: 'Lazarus Group', name: 'Lazarus Group' },
    { id: 'APT41', name: 'APT41' },
    { id: 'Sandworm', name: 'Sandworm' },
    { id: 'APT33', name: 'APT33 (Elfin)' },
    { id: 'Kimsuky', name: 'Kimsuky' },
  ];

  return (
    <TerminalWindow title="APT GROUP FILTER" className="mb-6">
      <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
        {aptGroups.map((group) => (
          <button
            key={group.id}
            onClick={() => onChange(group.id)}
            className={`w-full text-left p-2 transition ${
              selected === group.id 
                ? 'bg-cyber-green text-cyber-black' 
                : 'bg-transparent text-cyber-green hover:bg-cyber-green hover:bg-opacity-20'
            }`}
          >
            {group.name}
          </button>
        ))}
      </div>
    </TerminalWindow>
  );
}