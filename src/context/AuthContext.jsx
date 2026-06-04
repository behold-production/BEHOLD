import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and seed standard accounts from local storage
  useEffect(() => {
    const registeredUsers = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
    
    // Seed standard accounts
    const seedAccounts = [
      { id: 'u_student_1', name: 'Albin Siby', email: 'student@behold.com', password: 'student123', role: 'USER' },
      { id: 'u_psy_1', name: 'Muhammed Niyas S H', email: 'niyas@behold.com', password: 'niyas123', role: 'PSYCHOLOGIST' },
      { id: 'u_admin_1', name: 'Super Admin', email: 'admin@behold.com', password: 'admin123', role: 'ADMIN' }
    ];

    let dbUpdated = false;
    seedAccounts.forEach(account => {
      if (!registeredUsers.some(u => u.email === account.email)) {
        registeredUsers.push(account);
        dbUpdated = true;
      }
    });

    if (dbUpdated) {
      localStorage.setItem('behold_users_db', JSON.stringify(registeredUsers));
    }

    const savedUser = localStorage.getItem('behold_auth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const registeredUsers = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
        const foundUser = registeredUsers.find(u => u.email === email && u.password === password);
        
        if (foundUser) {
          const authData = { 
            name: foundUser.name, 
            email: foundUser.email, 
            id: foundUser.id, 
            role: foundUser.role || 'USER', 
            permissions: foundUser.permissions || null 
          };
          setUser(authData);
          localStorage.setItem('behold_auth_user', JSON.stringify(authData));
          resolve(authData);
        } else {
          reject(new Error("Invalid email or password"));
        }
      }, 800); // simulate network delay
    });
  };

  const register = (name, email, password, role = 'USER', permissions = null) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const registeredUsers = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
        if (registeredUsers.some(u => u.email === email)) {
          reject(new Error("Email is already registered"));
          return;
        }

        const newUser = { id: Date.now().toString(), name, email, password, role, permissions };
        registeredUsers.push(newUser);
        localStorage.setItem('behold_users_db', JSON.stringify(registeredUsers));

        const authData = { name, email, id: newUser.id, role, permissions };
        const currentActive = localStorage.getItem('behold_auth_user');
        
        // Only login the new user if it is self-signup (i.e. no one is currently logged in)
        if (!currentActive) {
          setUser(authData);
          localStorage.setItem('behold_auth_user', JSON.stringify(authData));
        }
        resolve(authData);
      }, 800); // simulate network delay
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('behold_auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
