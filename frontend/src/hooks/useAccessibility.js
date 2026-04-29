// ============================================================================
// useAccessibility — Global accessibility mode for elderly pilgrim users
// ============================================================================
//
// Designed for users 65+ who may struggle with small text, rapid animations,
// and tight touch targets. When accessibility mode is on:
//   - Text size increases to 'text-lg' via a class on <html>
//   - CSS motion is reduced (respects prefers-reduced-motion)
//   - Button padding increases via a CSS variable override
//
// State is persisted in localStorage('a11y_mode') so it survives page reloads.
// This is one of the few legitimate uses of localStorage remaining after the
// auth migration to cookies — accessibility preferences are not sensitive data.
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

/** localStorage key for accessibility mode persistence */
const STORAGE_KEY = 'a11y_mode';

/**
 * Hook that manages a global accessibility mode toggle.
 * Adds/removes classes and CSS variables on the <html> element.
 *
 * @returns {{ isAccessible: boolean, toggleAccessibility: Function }}
 */
const useAccessibility = () => {
  const [isAccessible, setIsAccessible] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Apply or remove accessibility overrides on the <html> element
  useEffect(() => {
    const html = document.documentElement;

    if (isAccessible) {
      // Larger base text for readability
      html.classList.add('text-lg');

      // Reduce motion for users who find animations disorienting
      html.style.setProperty('--a11y-btn-padding', '0.875rem 1.5rem');
      html.style.setProperty('--a11y-motion', 'none');

      // Add a meta stylesheet rule for reduced motion
      html.setAttribute('data-reduce-motion', 'true');
    } else {
      html.classList.remove('text-lg');
      html.style.removeProperty('--a11y-btn-padding');
      html.style.removeProperty('--a11y-motion');
      html.removeAttribute('data-reduce-motion');
    }

    // Persist preference
    try {
      localStorage.setItem(STORAGE_KEY, String(isAccessible));
    } catch {
      // localStorage unavailable — degrade gracefully
    }
  }, [isAccessible]);

  const toggleAccessibility = useCallback(() => {
    setIsAccessible(prev => !prev);
  }, []);

  return { isAccessible, toggleAccessibility };
};

export default useAccessibility;
