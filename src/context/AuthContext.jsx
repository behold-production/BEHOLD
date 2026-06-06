import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and seed standard accounts from local storage
  useEffect(() => {
    const registeredUsers = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
    
    // Seed standard accounts (Super Admin only)
    const seedAccounts = [
      { id: 'u_admin_1', name: 'Super Admin', email: 'admin@behold.com', password: 'admin123', role: 'ADMIN' }
    ];

    let dbUpdated = false;

    // Remove stale seed accounts if present
    const blacklistedEmails = [
      'student@behold.com',
      'josina@behold.com',
      'niyas@behold.com',
      'jahnavi@behold.com',
      'hana@behold.com',
      'surbinas@behold.com',
      'mary@behold.com',
      'anjali@behold.com',
      'mathew@behold.com'
    ];
    let filteredUsers = registeredUsers.filter(u => !blacklistedEmails.includes(u.email));
    if (filteredUsers.length !== registeredUsers.length) {
      dbUpdated = true;
    }
    
    // Update existing users in local storage if they are missing status/verified fields
    let updatedUsers = filteredUsers.map(u => {
      let modified = false;
      if (u.role === 'USER' && !u.status) {
        u.status = 'ACTIVE';
        modified = true;
      }
      if (u.role === 'PSYCHOLOGIST' && u.verified === undefined) {
        u.verified = true;
        modified = true;
      }
      if (modified) dbUpdated = true;
      return u;
    });

    seedAccounts.forEach(account => {
      const existingIdx = updatedUsers.findIndex(u => u.email === account.email);
      if (existingIdx !== -1) {
        let modified = false;
        if (updatedUsers[existingIdx].id !== account.id) {
          updatedUsers[existingIdx].id = account.id;
          modified = true;
        }
        if (updatedUsers[existingIdx].role !== account.role) {
          updatedUsers[existingIdx].role = account.role;
          modified = true;
        }
        if (modified) dbUpdated = true;
      } else {
        updatedUsers.push(account);
        dbUpdated = true;
      }
    });

    if (dbUpdated) {
      localStorage.setItem('behold_users_db', JSON.stringify(updatedUsers));
    }

    const savedUser = localStorage.getItem('behold_auth_user');
    if (savedUser) {
      try {
        const parsedSavedUser = JSON.parse(savedUser);
        // If the saved user was a blacklisted seed account, log them out
        if (blacklistedEmails.includes(parsedSavedUser.email)) {
          localStorage.removeItem('behold_auth_user');
          setUser(null);
        } else {
          setUser(parsedSavedUser);
        }
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
          if (foundUser.status === 'SUSPENDED') {
            reject(new Error("Your account has been suspended. Please contact support."));
            return;
          }
          const authData = { 
            name: foundUser.name, 
            email: foundUser.email, 
            id: foundUser.id, 
            role: foundUser.role || 'USER', 
            permissions: foundUser.permissions || null,
            customRoleTitle: foundUser.customRoleTitle || null
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

        const newUser = { 
          id: Date.now().toString(), 
          name, 
          email, 
          password, 
          role, 
          permissions,
          status: role === 'USER' ? 'ACTIVE' : undefined,
          verified: role === 'PSYCHOLOGIST' ? false : undefined
        };
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
