import React from 'react';
import { AlertTriangle, Shield, Mail, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { useNavigate } from 'react-router-dom';

function BanAnnouncement() {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleContactSupport = () => {
    // You can implement mailto or redirect to support page
    window.open('mailto:support@spliter.com?subject=Account Ban Appeal', '_blank');
  };

  return (
    <div className="page-container">
      {/* Logo ở góc trên trái giống trang Login */}
      <div className="absolute top-2 left-4 sm:top-4 sm:left-8 z-20">
        <Button
          className="w-[120px] h-[70px] sm:w-[180px] sm:h-[100px] font-['Pompiere',Helvetica] font-normal text-center bg-white/90 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none rounded-lg sm:rounded-none shadow-md sm:shadow-none"
          onClick={handleBackToLogin}
        >
          <span className="text-[#4285f4] text-4xl sm:text-6xl">Spliter</span>
        </Button>
      </div>

      <div className="page-main-content relative flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-16 min-h-screen max-h-screen overflow-hidden">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto flex flex-col justify-center py-12 sm:py-8 md:py-10 lg:py-12 xl:py-16 min-h-0">
          {/* Main Ban Notice Card */}
          <Card className="border border-red-200 sm:border-2 shadow-lg sm:shadow-2xl bg-white/95 backdrop-blur-sm mx-auto w-full">
            <CardContent className="p-3 sm:p-4 md:p-6 lg:p-7 text-center">
              {/* Warning Icon với animation */}
              <div className="mb-2 sm:mb-3 md:mb-4 lg:mb-5">
                <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-18 lg:h-18 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-9 lg:h-9 text-red-600" />
                </div>
              </div>

              {/* Main Heading với font đẹp hơn */}
              <h1 className="font-['Bree_Serif',Helvetica] text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-red-600 mb-2 sm:mb-3 md:mb-4">
                Account Suspended
              </h1>

              {/* Ban Notice với design cải thiện */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-2 sm:border-l-3 border-red-500 rounded-lg p-2 sm:p-3 md:p-4 lg:p-5 mb-2 sm:mb-3 md:mb-4 lg:mb-5 shadow-md">
                <div className="flex items-center justify-center mb-2 sm:mb-3 md:mb-4 lg:mb-5">
                  <div className="bg-red-500 rounded-full p-1 sm:p-1.5 md:p-2 mr-2 sm:mr-3">
                    <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                  <span className="font-['Poppins',Helvetica] text-xs sm:text-sm md:text-base lg:text-lg font-bold text-red-700">
                    Violation Notice
                  </span>
                </div>
                
                <p className="font-['Poppins',Helvetica] text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 mb-2 sm:mb-3 leading-relaxed text-center">
                  Your account has been suspended due to violations of our terms of service.
                </p>
              </div>

              {/* Appeal Process với design mới */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-2 sm:border-l-3 border-blue-500 rounded-lg p-2 sm:p-3 md:p-4 lg:p-5 mb-2 sm:mb-3 md:mb-4 lg:mb-5 shadow-md">
                <div className="flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                  <div className="bg-blue-500 rounded-full p-1 sm:p-1.5 md:p-2 mr-2 sm:mr-3">
                    <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  <h3 className="font-['Poppins',Helvetica] text-xs sm:text-sm md:text-base lg:text-lg font-bold text-blue-700">
                    Need Help?
                  </h3>
                </div>
                
                <p className="font-['Poppins',Helvetica] text-xs sm:text-sm md:text-base text-gray-700 text-center leading-relaxed">
                  Contact our support team if you believe this was an error.
                  <br />
                  <span className="text-xs text-gray-500 mt-1 sm:mt-2 inline-block">Response time: 3-5 business days</span>
                </p>
              </div>

              {/* Action Buttons với style mới */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center items-center mb-2 sm:mb-3 md:mb-4">
                <Button 
                  onClick={handleContactSupport}
                  className="w-full sm:w-auto bg-[#4285f4] hover:bg-[#78a7f1] text-white font-['Radio_Canada_Big',Helvetica] font-medium text-xs sm:text-sm md:text-base lg:text-lg rounded-[20px] h-[30px] sm:h-[35px] md:h-[40px] lg:h-[45px] px-3 sm:px-4 md:px-5 lg:px-6 flex items-center justify-center gap-1 sm:gap-2 md:gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="truncate">Contact Support</span>
                </Button>
                
                <Button 
                  onClick={handleBackToLogin}
                  className="w-full sm:w-auto bg-[#111111] hover:bg-[#696363] text-white font-['Roboto_Flex',Helvetica] font-medium text-xs sm:text-sm md:text-base lg:text-lg rounded-[20px] h-[30px] sm:h-[35px] md:h-[40px] lg:h-[45px] px-3 sm:px-4 md:px-5 lg:px-6 flex items-center justify-center gap-1 sm:gap-2 md:gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ArrowLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="truncate">Back to Login</span>
                </Button>
              </div>

              {/* Footer Notice với style mới */}
              <div className="pt-3 sm:pt-4 md:pt-6 border-t border-gray-300 pb-2">
                <p className="font-['Inter',Helvetica] text-xs sm:text-sm text-gray-500 leading-relaxed text-center px-2">
                  <span className="font-semibold text-gray-700">🛡️ Spliter</span> - Creating a safe environment for all users.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BanAnnouncement;