import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import HomeLayout from './domain/home/HomeLayout';
import { homeRoutes, RouteType } from './domain/home/homeRoutes';
import ProblemBoardLayout from './domain/problemBoard/ProblemBoardLayout';
import { problemRoutes } from './domain/problemBoard/problemBoardRoutes';
import RankingLayout from './domain/ranking/RankingLayout';
import { rankingRoutes } from './domain/ranking/rankingRoutes';
import RoadmapLayout from './domain/roadmap/RoadmapLayout';
import { roadmapRoutes } from './domain/roadmap/roadmapRoutes';
import { useAuthStore } from '@/share/store/authStore';
import { useEffect, useState } from 'react';
import { refreshAccessToken } from '@/share/utils/refreshAccessToken';
import MyProblemsLayout from '@/domain/myProblems/MyProblemsLayout';
import { myProblemsRoutes } from '@/domain/myProblems/myProblemsRoutes';
import CreateProblemLayout from '@/domain/createProblem/CreateProblemLayout';
import { createProblemsRoutes } from '@/domain/createProblem/createProblemsRoutes';

function renderRoutes(routes: RouteType[]) {
  {
    return routes.map((route: RouteType) => (
      <Route key={route.path} path={route.path} element={<route.component />} />
    ));
  }
}

function App() {
  const { refreshToken } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = (useAuthStore.persist?.onFinishHydration || (() => {}))(
      () => {
        setHydrated(true);
      },
    );
    if (useAuthStore.persist?.hasHydrated?.()) setHydrated(true);
    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      try {
        if (refreshToken) {
          await refreshAccessToken();
        }
      } finally {
        setReady(true);
      }
    })();
  }, [hydrated, refreshToken]);

  if (!ready) return <div>로딩 중…</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLayout />}>
          {renderRoutes(homeRoutes)}
        </Route>
        <Route
          path="/problems"
          element={<Navigate to="/problems/board" replace />}
        />
        <Route path="/problems" element={<ProblemBoardLayout />}>
          {renderRoutes(problemRoutes)}
        </Route>
        <Route path="/ranking" element={<RankingLayout />}>
          {renderRoutes(rankingRoutes)}
        </Route>
        <Route path="/roadmap" element={<RoadmapLayout />}>
          {renderRoutes(roadmapRoutes)}
        </Route>
        <Route path="/my-problems" element={<MyProblemsLayout />}>
          {renderRoutes(myProblemsRoutes)}
        </Route>
        <Route path="/create-problem" element={<CreateProblemLayout />}>
          {renderRoutes(createProblemsRoutes)}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
