const fs = require('fs');

let content = fs.readFileSync('frontend/src/features/admin/admin-dashboard/tabs/PsychologistManagementTab.jsx', 'utf8');

const depsToAdd = `
  const { bookingsDb, handleTogglePsyActiveStatus, updatingPsyIds, handleGenerateResetToken } = props;

  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [isAdminSearching, setIsAdminSearching] = useState(false);
  const [adminSearchResults, setAdminSearchResults] = useState([]);
  const [isAdminLocating, setIsAdminLocating] = useState(false);

  const handleAdminAddressSearch = async () => {
    if (!adminSearchQuery.trim()) return;
    setIsAdminSearching(true);
    try {
      const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(adminSearchQuery)}\`);
      if (res.ok) {
        const data = await res.json();
        setAdminSearchResults(data);
      } else {
        setAdminSearchResults([]);
      }
    } catch (err) {
      console.error(err);
      setAdminSearchResults([]);
    } finally {
      setIsAdminSearching(false);
    }
  };

  const handleAdminDetectLocation = () => {
    if (!navigator.geolocation) {
      import('react-hot-toast').then(m => m.toast.error("Geolocation not supported."));
      return;
    }
    setIsAdminLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setPsyForm(prev => ({ ...prev, latitude: lat, longitude: lon }));
        
        try {
          const res = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lon}\`);
          if (res.ok) {
            const data = await res.json();
            const locName = data.display_name || "Detected Location";
            setPsyForm(prev => ({ ...prev, locationName: locName }));
            setAdminSearchQuery(locName);
          }
        } catch (err) {
          console.error(err);
        }
        setIsAdminLocating(false);
        import('react-hot-toast').then(m => m.toast.success("Location updated."));
      },
      (err) => {
        console.error(err);
        setIsAdminLocating(false);
        import('react-hot-toast').then(m => m.toast.error("Failed to detect location."));
      },
      { timeout: 10000 }
    );
  };
`;

// Insert after `const handleAdminUserDetectLocation = () => { ... };`
content = content.replace(/const handleAdminUserDetectLocation = \(\) => \{\s*showAlert\("Location detection is currently unavailable in this context\."\);\s*\};/, depsToAdd);

fs.writeFileSync('frontend/src/features/admin/admin-dashboard/tabs/PsychologistManagementTab.jsx', content);
