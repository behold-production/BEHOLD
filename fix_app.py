import sys
with open('frontend/src/App.jsx', 'r') as f:
    content = f.read()

# Fix 1: Remove navigate('/')
target_1 = """    } else {
      if (path === '/profile' || path.startsWith('/admin') || path.startsWith('/counsellor') || path.startsWith('/conceller')) {
        navigate('/', { replace: true, state: { from: path } });
        setTimeout(() => setIsAuthModalOpen(true), 0);
      }
    }"""
replacement_1 = """    } else {
      if (path === '/profile' || path.startsWith('/admin') || path.startsWith('/counsellor') || path.startsWith('/conceller')) {
        setTimeout(() => setIsAuthModalOpen(true), 0);
      }
    }"""
content = content.replace(target_1, replacement_1)

# Fix 2: Admin Dashboard placeholder
target_2 = """          {/* Admin Dashboard */}
          <Route path="/admin" element={
            <div className="admin-console-theme">
              <AdminDashboard setView={() => { }} />
            </div>
          } />"""
replacement_2 = """          {/* Admin Dashboard */}
          <Route path="/admin" element={
            <div className="admin-console-theme">
              {user ? <AdminDashboard setView={() => { }} /> : <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
                <div className="animate-pulse flex flex-col items-center">
                  <ShieldAlert className="w-12 h-12 text-zinc-700 mb-4" />
                  <p className="text-zinc-500 font-medium tracking-widest uppercase text-sm">Authentication Required</p>
                </div>
              </div>}
            </div>
          } />"""
content = content.replace(target_2, replacement_2)

# Fix 3: Counsellor Dashboard placeholder
target_3 = """          {/* Counsellor Dashboard */}
          <Route path="/counsellor" element={
            <div className="counsellor-console-theme">
              <PsychologistDashboard setView={() => { }} />
            </div>
          } />"""
replacement_3 = """          {/* Counsellor Dashboard */}
          <Route path="/counsellor" element={
            <div className="counsellor-console-theme">
              {user ? <PsychologistDashboard setView={() => { }} /> : <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-white">
                <div className="animate-pulse flex flex-col items-center">
                  <ShieldAlert className="w-12 h-12 text-stone-700 mb-4" />
                  <p className="text-stone-500 font-medium tracking-widest uppercase text-sm">Authentication Required</p>
                </div>
              </div>}
            </div>
          } />"""
content = content.replace(target_3, replacement_3)

with open('frontend/src/App.jsx', 'w') as f:
    f.write(content)

print("Done")
