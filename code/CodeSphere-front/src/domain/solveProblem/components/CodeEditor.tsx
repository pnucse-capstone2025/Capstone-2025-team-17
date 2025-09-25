import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { syntaxHighlighting } from '@codemirror/language';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import {
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import React, { useEffect, useRef } from 'react';
import {
  baseTheme,
  fixedHeightEditor,
  minHeightEditor,
  myHighlightStyle,
} from './ligthTheme';

type Props = {
  initialCode: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
};

const CodeEditor: React.FC<Props> = ({
  initialCode,
  onChange,
  readOnly = false,
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    if (viewRef.current) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: initialCode,
        },
      });
    } else {
      console.error('EditorView is not initialized');
    }
  }, [initialCode]);

  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newCode = update.state.doc.toString();
        onChange?.(newCode);
      }
    });

    const readOnlyCompartment = new Compartment();

    const extensions: Extension[] = [
      lineNumbers(),
      highlightActiveLine(),
      python(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      updateListener,
      baseTheme,
      syntaxHighlighting(myHighlightStyle),
      fixedHeightEditor,
      minHeightEditor,
      // readOnly 값은 내부에서 처리되므로 그대로 넣어도 OK
      readOnlyCompartment.of(EditorState.readOnly.of(readOnly)),
      ...(readOnly
        ? [EditorView.editable.of(false), readOnlyTheme]
        : [EditorView.editable.of(true)]),
    ];

    const state = EditorState.create({
      doc: initialCode,
      extensions, // 이미 Extension[] 이므로 OK
    });

    viewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    });

    return () => {
      viewRef.current?.destroy();
    };
  }, []);
  return <div ref={editorRef} className="w-120px h-120px" />;
};

export default CodeEditor;

const readOnlyTheme = EditorView.theme({
  '&': {
    backgroundColor: '#f1f1f1', // 밝은 회색 배경
    color: '#444',
  },
  '.cm-content': {
    caretColor: 'transparent', // 커서 숨김 (선택사항)
  },
});
