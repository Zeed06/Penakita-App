import React, { useEffect } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  RichText, 
  Toolbar, 
  useEditorBridge, 
  TenTapStartKit,
} from '@10play/tentap-editor';
import { convertTiptapToBodyModel } from '../../utils/editor-converter';
import { useEditorStore } from '../../stores/editor.store';

interface MediumEditorProps {
  initialContent?: string;
}

export const MediumEditor = ({ initialContent }: MediumEditorProps) => {
  const setParagraphs = useEditorStore((state) => state.setParagraphs);

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: initialContent,
    bridgeExtensions: [
      ...TenTapStartKit,
    ],
    // Correct way to track changes in TenTap RN
    onChange: async () => {
      const json = await editor.getJSON();
      const bodyModel = convertTiptapToBodyModel(json);
      setParagraphs(bodyModel.paragraphs);
    },
    theme: {
      webview: {
        backgroundColor: '#ffffff',
      },
    },
  });

  // Medium-style CSS injection
  useEffect(() => {
    editor.injectCSS(`
      @import url('https://fonts.googleapis.com/css2?family=Charter:ital,wght@0,400;0,700;1,400&display=swap');
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-size: 18px;
        line-height: 1.6;
        color: #292929;
        padding-bottom: 100px;
      }

      .ProseMirror {
        padding: 0 4px;
        outline: none;
      }

      .ProseMirror p {
        margin-bottom: 1.2em;
      }

      .ProseMirror h1 {
        font-size: 32px;
        margin-top: 2em;
        margin-bottom: 0.5em;
        font-weight: 700;
        line-height: 1.2;
      }

      .ProseMirror h2 {
        font-size: 24px;
        margin-top: 1.8em;
        margin-bottom: 0.4em;
        font-weight: 600;
        line-height: 1.3;
      }

      .ProseMirror blockquote {
        border-left: 3px solid #292929;
        padding-left: 20px;
        margin-left: 0;
        font-style: italic;
        color: #757575;
      }

      .ProseMirror ul, .ProseMirror ol {
        padding-left: 24px;
        margin-bottom: 1.2em;
      }

      .ProseMirror li {
        margin-bottom: 0.5em;
      }

      .ProseMirror pre {
        background: #f4f4f4;
        padding: 16px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 14px;
        overflow-x: auto;
      }

      [data-placeholder]::before {
        content: attr(data-placeholder);
        float: left;
        color: #adb5bd;
        pointer-events: none;
        height: 0;
      }
    `);
  }, [editor]);

  return (
    <View style={styles.container}>
      <RichText 
        editor={editor} 
        style={styles.richText}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        style={styles.toolbarWrapper}
      >
        <Toolbar 
          editor={editor} 
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  richText: {
    flex: 1,
  },
  toolbarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  }
});
