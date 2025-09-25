import CreatedProblemList from '@/domain/createProblem/components/CreatedProblemList';
import CreateProblemPage from '@/domain/createProblem/components/CreateProblemPage';

import { useState } from 'react';

export default function CreateProblem() {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl">
        {/* 탭 네비게이션 */}
        <div className="mb-8 flex w-full justify-center pt-12">
          <div className="w-full rounded-lg border bg-white p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('list')}
              className={`w-1/2 rounded-md px-6 py-2 font-medium transition-colors ${
                activeTab === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:text-blue-100'
              }`}
            >
              생성된 문제 목록
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`w-1/2 rounded-md px-6 py-2 font-medium transition-colors ${
                activeTab === 'create'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:text-blue-100'
              }`}
            >
              새 문제 생성
            </button>
          </div>
        </div>
      </div>

      {/* 생성된 문제 목록 탭 */}

      {activeTab === 'list' && <CreatedProblemList />}
      {activeTab === 'create' && <CreateProblemPage />}
    </div>
  );
}
