import React, { use, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';
import { Input } from '../components/ui/input.jsx';
import { useUser } from '../hooks/useUser.js';

function BankAccountSetupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [errors, setErrors] = useState({});
  const { updateUser, userData } = useUser();

  const validate = () => {
    const newErrors = {};
    if (!bankAccountNumber.trim()) newErrors.bankAccountNumber = 'Account number is required';
    if (!bankAccountName.trim()) newErrors.bankAccountName = 'Account name is required';
    if (!bankName.trim()) newErrors.bankName = 'Bank is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // TODO: Send bank data to backend
    await updateUser({
      id : userData.id,
      bankAccountNumber: bankAccountNumber,
      bankAccountName: bankAccountName,
      bankName: bankName,
    });
    setLoading(false);
    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate('/login');
  };

  return (
    <div className="page-container">
      {/* Main Content - Chứa tất cả */}
      <div className="page-main-content relative flex items-center justify-center p-8">
        {/* Logo góc trên trái */}
        <Button
          className="absolute top-4 left-8 w-[180px] h-[100px] font-['Pompiere',Helvetica] font-normal text-center"
          onClick={handleLogoClick}
        >
          <span className="text-[#4285f4] text-6xl">Spliter</span>
        </Button>

        {/* Form Bank Setup ở giữa */}
        <div className="w-full max-w-[500px] flex flex-col justify-center min-h-[calc(100vh-120px)]">
          <Card className="w-full border-none shadow-none">
            {/* Bank Setup Header */}
            <div className="w-full text-center font-['Bree_Serif',Helvetica] font-normal text-black text-4xl mb-6">
              Bank Setup
            </div>
            <CardContent className="p-0 space-y-5">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Bank Account Number */}
                <div className="flex flex-col gap-1">
                  <label className="font-['Poppins',Helvetica] font-normal text-[#666666] text-lg">
                    Bank Account Number
                  </label>
                  <Input
                    type="text"
                    className="h-[35px] rounded-xl border-[#66666659]"
                    value={bankAccountNumber}
                    onChange={e => setBankAccountNumber(e.target.value)}
                    autoComplete="off"
                  />
                  <span className={`error-message text-[#ef0a0acc] text-sm min-h-[18px] ${errors.bankAccountNumber ? '' : 'invisible'}`}>
                    {errors.bankAccountNumber || 'placeholder'}
                  </span>
                </div>

                {/* Bank Account Name */}
                <div className="flex flex-col gap-1">
                  <label className="font-['Poppins',Helvetica] font-normal text-[#666666] text-lg">
                    Bank Account Name
                  </label>
                  <Input
                    type="text"
                    className="h-[35px] rounded-xl border-[#66666659]"
                    value={bankAccountName}
                    onChange={e => setBankAccountName(e.target.value)}
                    autoComplete="off"
                  />
                  <span className={`error-message text-[#ef0a0acc] text-sm min-h-[18px] ${errors.bankAccountName ? '' : 'invisible'}`}>
                    {errors.bankAccountName || 'placeholder'}
                  </span>
                </div>

                {/* Bank Name */}
                <div className="flex flex-col gap-1">
                  <label className="font-['Poppins',Helvetica] font-normal text-[#666666] text-lg">
                    Bank
                  </label>
                  <Input
                    type="text"
                    className="h-[35px] rounded-xl border-[#66666659]"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    autoComplete="off"
                  />
                  <span className={`error-message text-[#ef0a0acc] text-sm min-h-[18px] ${errors.bankName ? '' : 'invisible'}`}>
                    {errors.bankName || 'placeholder'}
                  </span>
                </div>

                {/* Save Button */}
                <Button
                  type="submit"
                  className="w-full h-[40px] bg-[#111111] hover:bg-[#3d3333] rounded-[20px] font-['Roboto_Flex',Helvetica] font-medium text-white text-lg"
                  disabled={loading}
                  id="bank-setup-btn"
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BankAccountSetupPage;
