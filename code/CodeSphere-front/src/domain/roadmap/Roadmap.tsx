import { Button } from '@/share/components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/share/components/ui/Card';
import { Badge } from '@/share/components/ui/Badge';
import { Separator } from '@/share/components/ui/Separator';
import {
  Code2,
  BookOpen,
  Trophy,
  Target,
  Play,
  Lightbulb,
  CheckCircle,
  Users,
  Star,
  Zap,
  Search,
  Filter,
  Award,
  HelpCircle,
  ArrowRight,
  Bookmark,
  TrendingUp,
  Clock,
} from 'lucide-react';

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 헤더 섹션 */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-gray-900">
            <Target className="mr-3 h-10 w-10 text-blue-600" />
            CodeSphere 학습 가이드
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            알고리즘 학습 플랫폼 사용법을 단계별로 안내해드립니다. 효과적인
            학습을 위한 모든 기능을 알아보세요!
          </p>
        </div>

        {/* 목차 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              목차
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <a
                  href="#getting-started"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  1. 시작하기
                </a>
                <a
                  href="#problem-solving"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  2. 문제 풀이 방법
                </a>
                <a
                  href="#hint-system"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  3. 힌트 시스템 활용
                </a>
                <a
                  href="#ranking-system"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  4. 랭킹 시스템
                </a>
              </div>
              <div className="space-y-2">
                <a
                  href="#problem-search"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  5. 문제 검색 및 필터링
                </a>
                <a
                  href="#tips"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  6. 학습 팁
                </a>
                <a
                  href="#faq"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  7. 자주 묻는 질문
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1. 시작하기 */}
        <section id="getting-started" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Play className="mr-3 h-6 w-6 text-green-600" />
                1. 시작하기
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  🎯 AlgoLearn이란?
                </h3>
                <p className="leading-relaxed text-gray-700">
                  AlgoLearn은 AI 기반 힌트 시스템을 제공하는 알고리즘 학습
                  플랫폼입니다. 백준, 코드포스, 프로그래머스, 리트코드 등의
                  문제를 풀면서 막힐 때 개인화된 힌트를 받을 수 있어 효과적인
                  학습이 가능합니다.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 text-lg font-semibold">🚀 첫 시작 단계</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-100 text-blue-800">1</Badge>
                    <div>
                      <p className="font-medium">회원가입 및 로그인</p>
                      <p className="text-sm text-gray-600">
                        우상단의 회원가입 버튼을 클릭하여 계정을 생성하세요.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-100 text-blue-800">2</Badge>
                    <div>
                      <p className="font-medium">첫 문제 선택</p>
                      <p className="text-sm text-gray-600">
                        홈 화면의 추천 문제나 "모든문제" 페이지에서 쉬운
                        문제부터 시작하세요.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-100 text-blue-800">3</Badge>
                    <div>
                      <p className="font-medium">언어 선택</p>
                      <p className="text-sm text-gray-600">
                        Python, Java, C++, C 중 편한 언어를 선택하여 코딩을
                        시작하세요.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 2. 문제 풀이 방법 */}
        <section id="problem-solving" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Code2 className="mr-3 h-6 w-6 text-purple-600" />
                2. 문제 풀이 방법
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  💻 코드 에디터 사용법
                </h3>
                <div className="rounded-lg bg-gray-50 p-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      <strong>언어 선택:</strong> 상단 드롭다운에서 프로그래밍
                      언어 선택
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      <strong>코드 작성:</strong> 에디터에서 자유롭게 코드 작성
                      (Tab 키로 들여쓰기)
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      <strong>실행 테스트:</strong> "실행" 버튼으로 코드 동작
                      확인
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      <strong>최종 제출:</strong> "제출" 버튼으로 정답 여부 확인
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">📊 결과 확인</h3>
                <p className="mb-3 text-gray-700">
                  제출 후 다음 정보를 확인할 수 있습니다:
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded border border-green-200 bg-green-50 p-3">
                    <h4 className="mb-1 font-medium text-green-800">
                      ✅ 통과 시
                    </h4>
                    <p className="text-sm text-green-700">
                      실행 시간, 메모리 사용량, 테스트 케이스 결과
                    </p>
                  </div>
                  <div className="rounded border border-red-200 bg-red-50 p-3">
                    <h4 className="mb-1 font-medium text-red-800">
                      ❌ 실패 시
                    </h4>
                    <p className="text-sm text-red-700">
                      어떤 테스트 케이스에서 실패했는지 상세 정보
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 3. 힌트 시스템 활용 */}
        <section id="hint-system" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Lightbulb className="mr-3 h-6 w-6 text-yellow-600" />
                3. 힌트 시스템 활용
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <h3 className="mb-3 text-lg font-semibold text-yellow-800">
                  🤖 AI 기반 개인화 힌트
                </h3>
                <p className="leading-relaxed text-yellow-700">
                  AlgoLearn의 핵심 기능! 여러분이 작성한 코드를 AI가 분석하여
                  현재 상황에 맞는 맞춤형 힌트를 제공합니다.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  💡 힌트 사용 방법
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-yellow-100 text-yellow-800">1</Badge>
                    <div>
                      <p className="font-medium">문제 풀이 중 막힐 때</p>
                      <p className="text-sm text-gray-600">
                        코드를 어느 정도 작성한 후 "힌트보기" 버튼 클릭
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-yellow-100 text-yellow-800">2</Badge>
                    <div>
                      <p className="font-medium">AI 분석 대기</p>
                      <p className="text-sm text-gray-600">
                        작성한 코드와 문제 정보를 AI가 분석합니다
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-yellow-100 text-yellow-800">3</Badge>
                    <div>
                      <p className="font-medium">맞춤형 힌트 확인</p>
                      <p className="text-sm text-gray-600">
                        현재 상황에 맞는 구체적인 힌트를 받아보세요
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 font-medium text-blue-800">
                  ⚠️ 힌트 사용 제한
                </h4>
                <p className="text-sm text-blue-700">
                  각 문제당 최대 3번까지 힌트를 사용할 수 있습니다. 힌트를
                  현명하게 활용하여 학습 효과를 극대화하세요!
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 4. 랭킹 시스템 */}
        <section id="ranking-system" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Trophy className="mr-3 h-6 w-6 text-yellow-600" />
                4. 랭킹 시스템
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  🏆 점수 계산 방식
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">
                        <strong>문제 해결:</strong> 난이도별 기본 점수
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">
                        <strong>속도 보너스:</strong> 빠른 해결 시 추가 점수
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        <strong>연속 해결:</strong> 연속 성공 시 보너스
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">
                        <strong>정확도:</strong> 한 번에 성공 시 보너스
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">
                        <strong>힌트 사용:</strong> 적게 사용할수록 높은 점수
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">🎖️ 레벨 시스템</h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded border border-orange-200 bg-orange-50 p-3 text-center">
                    <div className="mb-1 text-2xl">🔰</div>
                    <div className="font-medium text-orange-800">브론즈</div>
                    <div className="text-xs text-orange-600">0-999점</div>
                  </div>
                  <div className="rounded border border-gray-200 bg-gray-50 p-3 text-center">
                    <div className="mb-1 text-2xl">🥈</div>
                    <div className="font-medium text-gray-800">실버</div>
                    <div className="text-xs text-gray-600">1000-1999점</div>
                  </div>
                  <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-center">
                    <div className="mb-1 text-2xl">🥇</div>
                    <div className="font-medium text-yellow-800">골드</div>
                    <div className="text-xs text-yellow-600">2000-2999점</div>
                  </div>
                  <div className="rounded border border-cyan-200 bg-cyan-50 p-3 text-center">
                    <div className="mb-1 text-2xl">💎</div>
                    <div className="font-medium text-cyan-800">플래티넘</div>
                    <div className="text-xs text-cyan-600">3000점+</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 5. 문제 검색 및 필터링 */}
        <section id="problem-search" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Search className="mr-3 h-6 w-6 text-blue-600" />
                5. 문제 검색 및 필터링
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  🔍 효율적인 문제 찾기
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Search className="mt-0.5 h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">키워드 검색</p>
                      <p className="text-sm text-gray-600">
                        문제 제목이나 태그로 원하는 문제를 빠르게 찾을 수
                        있습니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Filter className="mt-0.5 h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">다양한 필터</p>
                      <p className="text-sm text-gray-600">
                        난이도, 카테고리, 해결 상태, 태그별로 문제를
                        필터링하세요.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Bookmark className="mt-0.5 h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">북마크 기능</p>
                      <p className="text-sm text-gray-600">
                        나중에 풀고 싶은 문제는 북마크로 저장해두세요.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <h4 className="mb-2 font-medium text-green-800">
                  💡 추천 학습 순서
                </h4>
                <ol className="space-y-1 text-sm text-green-700">
                  <li>1. 쉬움 난이도 문제로 기초 다지기</li>
                  <li>2. 특정 알고리즘 카테고리 집중 학습</li>
                  <li>3. 보통 난이도로 실력 향상</li>
                  <li>4. 어려움 난이도로 도전하기</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 6. 학습 팁 */}
        <section id="tips" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Star className="mr-3 h-6 w-6 text-purple-600" />
                6. 효과적인 학습 팁
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h4 className="mb-2 flex items-center font-medium text-blue-800">
                      <Clock className="mr-2 h-4 w-4" />
                      꾸준한 학습
                    </h4>
                    <p className="text-sm text-blue-700">
                      매일 조금씩이라도 꾸준히 문제를 풀어보세요. 연속 학습
                      일수가 늘어날수록 보너스 점수를 받을 수 있습니다.
                    </p>
                  </div>

                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <h4 className="mb-2 flex items-center font-medium text-green-800">
                      <Target className="mr-2 h-4 w-4" />
                      단계적 접근
                    </h4>
                    <p className="text-sm text-green-700">
                      어려운 문제에 바로 도전하지 말고, 쉬운 문제부터 차근차근
                      해결하며 실력을 쌓아가세요.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <h4 className="mb-2 flex items-center font-medium text-yellow-800">
                      <Lightbulb className="mr-2 h-4 w-4" />
                      힌트 활용
                    </h4>
                    <p className="text-sm text-yellow-700">
                      막힐 때는 힌트를 적극 활용하세요. 하지만 바로 힌트를 보지
                      말고 충분히 고민한 후 사용하는 것이 좋습니다.
                    </p>
                  </div>

                  <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                    <h4 className="mb-2 flex items-center font-medium text-purple-800">
                      <Users className="mr-2 h-4 w-4" />
                      다른 풀이 참고
                    </h4>
                    <p className="text-sm text-purple-700">
                      문제를 해결한 후에는 다른 사용자들의 풀이도 참고해보세요.
                      새로운 접근 방법을 배울 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 7. 자주 묻는 질문 */}
        <section id="faq" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <HelpCircle className="mr-3 h-6 w-6 text-red-600" />
                7. 자주 묻는 질문 (FAQ)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="mb-1 font-medium text-gray-900">
                    Q. 힌트를 사용하면 점수가 깎이나요?
                  </h4>
                  <p className="text-sm text-gray-600">
                    A. 힌트 사용 횟수에 따라 점수가 조정됩니다. 힌트를 적게
                    사용할수록 더 높은 점수를 받을 수 있어요.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="mb-1 font-medium text-gray-900">
                    Q. 같은 문제를 여러 번 풀 수 있나요?
                  </h4>
                  <p className="text-sm text-gray-600">
                    A. 네, 가능합니다! 하지만 점수는 첫 번째 성공 시에만
                    부여됩니다. 복습 차원에서 다시 풀어보는 것은 언제든
                    환영입니다.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="mb-1 font-medium text-gray-900">
                    Q. 어떤 프로그래밍 언어를 사용해야 하나요?
                  </h4>
                  <p className="text-sm text-gray-600">
                    A. Python, Java, C++, C를 지원합니다. 초보자라면 Python을
                    추천하며, 익숙한 언어가 있다면 그것을 사용하세요.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="mb-1 font-medium text-gray-900">
                    Q. 랭킹은 언제 업데이트되나요?
                  </h4>
                  <p className="text-sm text-gray-600">
                    A. 실시간으로 업데이트됩니다. 문제를 해결하면 즉시 점수와
                    순위에 반영됩니다.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="mb-1 font-medium text-gray-900">
                    Q. 문제에 오류가 있다면 어떻게 신고하나요?
                  </h4>
                  <p className="text-sm text-gray-600">
                    A. 각 문제 페이지 하단의 "문제 신고" 버튼을 이용하거나,
                    고객센터를 통해 문의해주세요.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 마무리 */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-100">
          <CardContent className="p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-blue-900">
              🎉 이제 시작해보세요!
            </h2>
            <p className="mx-auto mb-6 max-w-2xl text-blue-700">
              AlgoLearn과 함께 체계적이고 효과적인 알고리즘 학습을 시작하세요.
              AI 힌트 시스템과 함께라면 어려운 문제도 단계별로 해결할 수
              있습니다!
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Play className="mr-2 h-5 w-5" />첫 문제 풀어보기
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-300 bg-transparent text-blue-700"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                모든 문제 둘러보기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
