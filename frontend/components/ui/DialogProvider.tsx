import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import M3Dialog, { M3DialogAction } from './M3Dialog';
import { Ionicons } from '@expo/vector-icons';

interface DialogOptions {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  actions?: M3DialogAction[];
}

interface DialogContextValue {
  showAlert: (title: string, body?: string) => void;
  showConfirm: (title: string, body: string, onConfirm: () => void) => void;
  showDestructive: (title: string, body: string, onConfirm: () => void) => void;
  showDialog: (options: DialogOptions) => void;
  dismiss: () => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<DialogOptions>({ title: '' });

  const dismiss = useCallback(() => setVisible(false), []);

  const showDialog = useCallback((opts: DialogOptions) => {
    setOptions(opts);
    setVisible(true);
  }, []);

  const showAlert = useCallback((title: string, body?: string) => {
    showDialog({
      icon: 'information-circle',
      title,
      body,
      actions: [{ label: 'OK', onPress: () => setVisible(false), variant: 'filled' }],
    });
  }, [showDialog]);

  const showConfirm = useCallback((title: string, body: string, onConfirm: () => void) => {
    showDialog({
      icon: 'help-circle',
      title,
      body,
      actions: [
        { label: 'Cancel', onPress: () => setVisible(false), variant: 'text' },
        { label: 'Confirm', onPress: () => { setVisible(false); onConfirm(); }, variant: 'filled' },
      ],
    });
  }, [showDialog]);

  const showDestructive = useCallback((title: string, body: string, onConfirm: () => void) => {
    showDialog({
      icon: 'warning',
      title,
      body,
      actions: [
        { label: 'Cancel', onPress: () => setVisible(false), variant: 'text' },
        { label: 'Delete', onPress: () => { setVisible(false); onConfirm(); }, variant: 'destructive' },
      ],
    });
  }, [showDialog]);

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm, showDestructive, showDialog, dismiss }}>
      {children}
      <M3Dialog
        visible={visible}
        onDismiss={dismiss}
        icon={options.icon}
        title={options.title}
        body={options.body}
        actions={options.actions}
      />
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return ctx;
}
