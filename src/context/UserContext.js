import React, { createContext, useState, useMemo } from 'react';

export const UserContext = createContext({
  profile: null,
  setProfile: () => {},
});

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);

  const value = useMemo(() => ({ profile, setProfile }), [profile]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};


