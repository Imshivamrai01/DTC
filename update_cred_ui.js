const fs = require('fs');
const files = [
  'c:/Users/Shiva/Downloads/DTC/edtech-platform/src/app/(dashboard)/admin/students/page.tsx',
  'c:/Users/Shiva/Downloads/DTC/edtech-platform/src/app/(dashboard)/coordinator/students/page.tsx'
];

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Add credModal state
  if (!content.includes('const [credModal')) {
    content = content.replace(
      'const [generatedCreds, setGeneratedCreds] = useState<any>(null);',
      'const [generatedCreds, setGeneratedCreds] = useState<any>(null);\n  const [credModal, setCredModal] = useState<{type: "STUDENT"|"PARENT", email: string, password: string} | null>(null);'
    );
  }

  // 2. Replace handleGenerateCredentials
  const handleGenMatch = /const handleGenerateCredentials = async[\s\S]*?setGeneratingCreds\(null\);\n    }\n  };/m;
  if (handleGenMatch.test(content)) {
    const replacement = `const openCredModal = (type: 'STUDENT' | 'PARENT') => {
    setCredModal({ type, email: '', password: '' });
  };

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credModal || !credModal.email || !credModal.password) return;

    setGeneratingCreds(credModal.type);
    try {
      const res = await fetch(\`/api/v1/students/\${selectedStudent.id}/credentials\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: credModal.type, email: credModal.email, password: credModal.password })
      });
      const data = await res.json();
      
      if (res.ok && data.credentials) {
        setGeneratedCreds({ type: credModal.type, ...data.credentials });
        fetchCredentials(selectedStudent.id);
        setCredModal(null);
        useUIStore.getState().addToast("Credentials saved successfully!", "success");
      } else {
        useUIStore.getState().addToast(data.error || 'Failed to generate credentials', "error");
      }
    } catch (err) {
      console.error(err);
      useUIStore.getState().addToast('An error occurred', "error");
    } finally {
      setGeneratingCreds(null);
    }
  };`;
    content = content.replace(handleGenMatch, replacement);
  }

  // 3. Replace onClick handleGenerateCredentials
  content = content.replace(/handleGenerateCredentials\(/g, 'openCredModal(');

  // 4. Add the CredModal UI before the main return or at the end of AnimatePresence
  if (!content.includes('Manage Login Credentials') && content.includes('{/* FORM MODAL (ADD / EDIT) */}')) {
    const credModalUI = `
      {/* CREDENTIALS MODAL */}
      <AnimatePresence>
        {credModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '2rem' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '400px', border: '1px solid var(--color-border)' }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Manage {credModal.type === 'STUDENT' ? 'Student' : 'Parent'} Login</h2>
              <form onSubmit={submitCredentials}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email Address</label>
                  <Input value={credModal.email} onChange={e => setCredModal({...credModal, email: e.target.value})} type="email" required />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span>Password</span>
                    <button type="button" onClick={() => setCredModal({...credModal, password: Math.random().toString(36).slice(-8)})} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.75rem' }}>Generate Random</button>
                  </label>
                  <Input value={credModal.password} onChange={e => setCredModal({...credModal, password: e.target.value})} required />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button type="button" variant="ghost" style={{ flex: 1 }} onClick={() => setCredModal(null)}>Cancel</Button>
                  <Button type="submit" style={{ flex: 1 }} disabled={generatingCreds === credModal.type}>{generatingCreds === credModal.type ? 'Saving...' : 'Save'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;
    content = content.replace('{/* FORM MODAL (ADD / EDIT) */}', credModalUI + '\n      {/* FORM MODAL (ADD / EDIT) */}');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed ' + filePath);
});
