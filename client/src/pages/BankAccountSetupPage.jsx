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

    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate('/login');
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full min-h-screen">
      <div className="bg-white w-full max-w-[1500px] relative py-12">
        <Button
          className="absolute w-[230px] h-[130px] top-8 left-0 font-['Pompiere',Helvetica] font-normal text-center text-[64px]"
          onClick={handleLogoClick}
        >
          <span className="text-[#4285f4] text-8xl">Spliter</span>
        </Button>

        <div className="flex flex-col items-center justify-center mt-0 scale-80">
          <Card className="w-full max-w-[489px] border-none shadow-none scale-80">
            <div className="w-full text-center font-['Bree_Serif',Helvetica] font-normal text-black text-[50px] mb-4">
              Bank Setup
            </div>
            <CardContent className="p-0 space-y-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Bank Account Number */}
                <div className="flex flex-col gap-0">
                  <label className="font-['Poppins',Helvetica] font-normal text-[#666666] text-2xl">
                    Bank Account Number
                  </label>
                  <Input
                    type="text"
                    className="h-[35px] rounded-xl border-[#66666659]"
                    value={bankAccountNumber}
                    onChange={e => setBankAccountNumber(e.target.value)}
                    autoComplete="off"
                  />
                  <span className={`error-message text-[#ef0a0acc] ${errors.bankAccountNumber ? '' : 'invisible'}`}>
                    {errors.bankAccountNumber || 'placeholder'}
                  </span>
                </div>

                {/* Bank Account Name */}
                <div className="flex flex-col gap-0">
                  <label className="font-['Poppins',Helvetica] font-normal text-[#666666] text-2xl">
                    Bank Account Name
                  </label>
                  <Input
                    type="text"
                    className="h-[35px] rounded-xl border-[#66666659]"
                    value={bankAccountName}
                    onChange={e => setBankAccountName(e.target.value)}
                    autoComplete="off"
                  />
                  <span className={`error-message text-[#ef0a0acc] ${errors.bankAccountName ? '' : 'invisible'}`}>
                    {errors.bankAccountName || 'placeholder'}
                  </span>
                </div>

                {/* Bank Branch */}
                <div className="flex flex-col gap-0">
                  <label className="font-['Poppins',Helvetica] font-normal text-[#666666] text-2xl">
                    Bank
                  </label>
                  <Input
                    type="text"
                    className="h-[35px] rounded-xl border-[#66666659]"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    autoComplete="off"
                  />
                  <span className={`error-message text-[#ef0a0acc] ${errors.bankName ? '' : 'invisible'}`}>
                    {errors.bankName || 'placeholder'}
                  </span>
                </div>

                {/* Save Button */}
                <Button
                  type="submit"
                  className="w-full h-10 bg-[#111111] hover:bg-[#3d3333] rounded-[20px] font-['Roboto_Flex',Helvetica] font-medium text-white text-[25px]"
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
