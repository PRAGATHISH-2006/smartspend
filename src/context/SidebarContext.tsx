// SidebarContext: Manages mobile sidebar drawer toggle and desktop responsive state

import React, { createContext, useContext, useState } from 'react';
import { useWindowDimensions } from 'react-native';

interface SidebarContextType {
  isDesktop: boolean;
  mobileMenuVisible: boolean;
  toggleMobileMenu: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [mobileMenuVisible, setMobileMenuVisible] = useState<boolean>(false);

  const toggleMobileMenu = () => setMobileMenuVisible((prev) => !prev);
  const openMobileMenu = () => setMobileMenuVisible(true);
  const closeMobileMenu = () => setMobileMenuVisible(false);

  return (
    <SidebarContext.Provider
      value={{
        isDesktop,
        mobileMenuVisible,
        toggleMobileMenu,
        openMobileMenu,
        closeMobileMenu,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isDesktop: false,
      mobileMenuVisible: false,
      toggleMobileMenu: () => {},
      openMobileMenu: () => {},
      closeMobileMenu: () => {},
    };
  }
  return context;
}

