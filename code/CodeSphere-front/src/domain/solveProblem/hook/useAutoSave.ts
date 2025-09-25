import { postSubmissionsSave } from '@/share/api/submissions.api';
import useDebounce from '@/share/hooks/useDebounce';
import { useEffect } from 'react';

export function useAutoSave({
  code,
  real_pid,
  language,
  accessToken,
}: {
  code: string;
  real_pid: string;
  accessToken: string;
  language: 'python';
}) {
  // 로컬 초안: 자주 저장(가벼움)
  const saveDraft = useDebounce(() => {
    localStorage.setItem(`draft:${real_pid}`, code);
  }, 400);

  // 서버 저장: 입력 멈춤 기준 + 최대 대기 보장
  const saveServer = useDebounce(
    async () => {
      // 변경 없으면 스킵(선택)
      const lastHash = localStorage.getItem(`hash:${real_pid}`);
      const hash = String(code.length) + ':' + (code.charCodeAt(0) || 0); // 예시용 가벼운 해시
      if (hash === lastHash) return;

      await postSubmissionsSave({
        real_pid,
        language,
        code,
        auth: accessToken ? accessToken : '',
      });

      localStorage.setItem(`hash:${real_pid}`, hash);
    },
    2000,
    30000,
  ); // 2s 디바운스, 30s maxWait

  const toDelete: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (k.startsWith('draft:') && k !== `draft:${real_pid}`) {
      toDelete.push(k);
    }
    if (k.startsWith('hash:') && k !== `hash:${real_pid}`) {
      toDelete.push(k);
    }
  }

  useEffect(() => {
    if (
      !accessToken ||
      real_pid === undefined ||
      real_pid === null ||
      real_pid === ''
    )
      return;

    toDelete.forEach((k) => localStorage.removeItem(k));

    saveDraft();
    saveServer();
  }, [code, saveDraft, saveServer]);

  // blur/탭 닫기 시 마지막 저장
  useEffect(() => {
    if (
      !accessToken ||
      real_pid === undefined ||
      real_pid === null ||
      real_pid === ''
    )
      return;

    toDelete.forEach((k) => localStorage.removeItem(k));

    const beforeUnloadHandler = async () => {
      await postSubmissionsSave({
        real_pid,
        language,
        code,
        auth: accessToken ? accessToken : '',
      });
    };

    const keydownHandler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        beforeUnloadHandler();
      }
    };

    window.addEventListener('beforeunload', beforeUnloadHandler);
    window.addEventListener('keydown', keydownHandler);

    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      window.removeEventListener('keydown', keydownHandler);
    };
  }, [code, real_pid]);

  // 에디터 blur에서 즉시 저장하고 싶다면 에디터 prop으로 handler 연결
}
