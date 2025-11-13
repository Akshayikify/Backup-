import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  ShieldCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <ShieldCheckIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to PixelGenesis
          </h1>
          <p className="text-gray-600">
            Choose your role to continue
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/user-login')}
            className="w-full p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-blue-500">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">User</h3>
                  <p className="text-sm text-gray-600">
                    Upload and manage your documents
                  </p>
                </div>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-blue-500" />
            </div>
          </button>

          <button
            onClick={() => navigate('/verifier-login')}
            className="w-full p-6 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-purple-500">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">Verifier</h3>
                  <p className="text-sm text-gray-600">
                    Verify documents on the blockchain
                  </p>
                </div>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-purple-500" />
            </div>
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Select your role to sign in or create a new account</p>
        </div>
      </div>
    </div>
  );
}

export default Login;

