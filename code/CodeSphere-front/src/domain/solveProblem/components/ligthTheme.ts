import { HighlightStyle } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

export const baseTheme = EditorView.baseTheme({
  '.cm-o-replacement': {
    display: 'inline-block',
    width: '.5em',
    height: '.5em',
    borderRadius: '.25em',
  },
  '&light .cm-o-replacement': {
    backgroundColor: '#04c',
  },
  '&dark .cm-o-replacement': {
    backgroundColor: '#5bf',
  },
});

export const myHighlightStyle = HighlightStyle.define([
  // 키워드 (if, else, def, return, etc.)
  { tag: t.keyword, color: '#d73a49', fontWeight: 'bold' },

  // 문자열 (예: "hello")
  { tag: t.string, color: '#032f62' },

  // 숫자 (123, 3.14, etc.)
  { tag: t.number, color: '#005cc5' },

  // 주석
  { tag: t.comment, color: '#6a737d', fontStyle: 'italic' },

  // 연산자 (+, -, =, *, etc.)
  { tag: t.operator, color: '#d73a49' },

  // 변수 이름 (일반)
  { tag: t.variableName, color: '#24292e' },

  // 정의된 변수/함수
  { tag: t.definition(t.variableName), color: '#005cc5' },

  // 함수 호출 시의 이름
  { tag: t.function(t.variableName), color: '#6f42c1' },

  // 클래스 이름
  { tag: t.className, color: '#6f42c1', fontWeight: 'bold' },

  // 괄호, 중괄호, 대괄호
  { tag: [t.paren, t.brace, t.bracket], color: '#24292e' },

  // 불리언, null
  { tag: [t.bool, t.null], color: '#e36209' },
]);

export const fixedHeightEditor = EditorView.theme({
  '&': { height: '600px' },
  '.cm-scroller': { overflow: 'auto' },
});

export const minHeightEditor = EditorView.theme({
  '.cm-content, .cm-gutter': { minHeight: '200px' },
});
