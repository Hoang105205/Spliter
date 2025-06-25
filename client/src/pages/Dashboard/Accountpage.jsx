import { BellIcon, ChevronDownIcon, PencilIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent } from "../../components/ui/card.jsx";
import { Select, SelectTrigger, SelectValue } from "../../components/ui/select.jsx";
import { Separator } from "../../components/ui/seperator.jsx";
import Head_bar from "../../components/ui/headbar.jsx";   

import { useUser } from '../../hooks/useUser.js';

function AccountPage() {
  const { userData, setUserData } = useUser();
  const [localData, setLocalData] = useState({
    username: '',
    email: '',
    phone_number: '',
    password: '',
    role: '',
    createdAt: '',
    updatedAt: '',
    bio: '',
  });

  useEffect(() => {
    // When the component mounts, fetch the user data
    setLocalData({
      username: userData.username || '',
      email: userData.email || '',
      phone_number: userData.phone_number || '',
      password: userData.password || '',
      role: userData.role || '',
      createdAt: userData.createdAt || '',
      updatedAt: userData.updatedAt || '',
      bio: userData.bio || '',
    });
  }, [userData]);

  const [editText, setEditText] = useState("Edit");
  var defaultBio = "There is still nothing here, how about you spice something up?"
  
  if (localData.bio !== "") {
    defaultBio = localData.bio
  }

  const [editState, setEditState] = useState(false)
  const [editIState, setEditIState] = useState(false)
  const [currentPass, setCurrentPass] = useState("")
  const [newPass, setNewPass] = useState("")

  const onEditClick = () => {
    if (editState == false) {
      setEditText("Confirm")
      setEditState(true)
    }
    else {
      setEditText("Edit")
      setEditState(false)
    }
  }

  const onEditIClick = () => {
    if (editIState == false) {
      setEditIState(true)
    }
    else {
      setEditIState(false)
      setCurrentPass("")
      setNewPass("")
    }
  }

  const setBio = (event) => {
    setLocalData({
      ...localData,
      bio: event.target.value,
    });
  };

  const setName = (event) => {
    setLocalData({
      ...localData,
      username: event.target.value,
    });
  };

  const setEmail = (event) => {
    setLocalData({
      ...localData,
      email: event.target.value,
    });
  };

  const setPhone = (event) => {
    setLocalData({
      ...localData,
      phone_number: event.target.value,
    });
  };

  const setCurrentPassword = (event) => {
    setCurrentPass(event.target.value)
  }

  const setNewPassword = (event) => {
    setNewPass(event.target.value)
  }

  if (!userData) {
    // Đợi dữ liệu, render loading
    return <div>Đang tải dữ liệu tài khoản...</div>;
  }

  return (
    <main className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-x-hidden w-[1500px] relative py-5">
        <div className="mx-auto w-[1409px] relative">
          {/* Header */}
          <Head_bar />

          {/* Main content */}
          <div className="flex mt-8">
            {/* Left section */}
            <div className="flex flex-col items-center w-[400px]">
              <h1 className="[font-family:'Roboto_Slab',Helvetica] font-bold text-black text-[35px] text-center mb-4">
                Your Account
              </h1>

              <Avatar className="w-[216px] h-[216px] bg-[#d9d9d9] rounded-[108px]">
                <AvatarFallback></AvatarFallback>
              </Avatar>

              <Button onClick={onEditClick} className="mt-5 w-[110px] h-13 rounded-[15px] bg-[#5a96f0] hover:bg-[#4a86e0] transition-colors duration-200 border border-transparent hover:border-white">
                <span className="[font-family:'Roboto_Condensed',Helvetica] font-normal text-white text-[23.5px]">
                  {editText}
                </span>
              </Button>

              <Card className="mt-5 w-[319px] h-[174px] rounded-[15px] border-2 border-solid border-[#d1d1d1]">
                <CardContent className="p-3">
                  {!editState &&
                  <p className="[font-family:'Roboto_Condensed',Helvetica] font-normal text-[#b3b3b3] text-base">
                    {defaultBio}
                  </p>}

                  {editState &&
                  <textarea onChange={setBio} className="resize-none w-[300px] h-[150px] focus:border-0 focus:outline-none [font-family:'Roboto_Condensed',Helvetica] font-normal text-[#b3b3b3] text-base" value = {localData.bio}></textarea>}
                </CardContent>
              </Card>
            </div>

            {/* Middle section */}
            <div className="flex flex-col w-[350px] ml-16 space-y-6">
              <div className="space-y-2">
                <label className="block [font-family:'Roboto_Condensed',Helvetica] font-normal text-black text-[25px]">
                  Your name
                </label>
                {!editIState && 
                <p className="[font-family:'Roboto_Condensed',Helvetica] font-bold text-black text-[25px]">
                  {localData.username}
                </p>}
                {editIState && <input onChange={setName} className="w-[350px] border border-gray-300 p-1 rounded [font-family:'Roboto_Condensed',Helvetica] font-bold text-black text-[25px]" value = {localData.username}></input>}
              </div>

              <div className="space-y-2">
                <label className="block [font-family:'Roboto_Condensed',Helvetica] font-normal text-black text-[25px]">
                  Your email address
                </label>
                {!editIState && 
                <p className="[font-family:'Roboto_Condensed',Helvetica] font-bold text-black text-[25px]">
                  {localData.email}
                </p>}
                {editIState && <input onChange={setEmail} className="w-[350px] border border-gray-300 p-1 rounded [font-family:'Roboto_Condensed',Helvetica] font-bold text-black text-[25px]" value = {localData.email}></input>}
              </div>

              <div className="space-y-2">
                <label className="block [font-family:'Roboto_Condensed',Helvetica] font-normal text-black text-[25px]">
                  Your phone number
                </label>
                {!editIState &&
                <p className="[font-family:'Roboto_Condensed',Helvetica] font-bold text-black text-[25px]">
                  {localData.phone_number}
                </p>}
                {editIState && <input onChange={setPhone} className="w-[350px] border border-gray-300 p-1 rounded [font-family:'Roboto_Condensed',Helvetica] font-bold text-black text-[25px]" value = {localData.phone_number}></input>}
              </div>

              <div className="space-y-2">
                <label className="block [font-family:'Roboto_Condensed',Helvetica] font-normal text-black text-[25px]">
                  Your password
                </label>

                {!editIState &&
                <p className="[font-family:'Roboto_Condensed',Helvetica] font-bold text-black text-[25px]">
                  {localData.password}
                </p>}

                {editIState &&
                <p className="[font-family:'Roboto_Condensed',Helvetica] font-normal text-black text-[20px]"> Current password </p>}
                {editIState &&
                <input onChange={setCurrentPassword} className="w-[350px] border border-gray-300 p-1 rounded [font-family:'Roboto_Condensed',Helvetica] font-bold text-black text-[25px]" value = {currentPass}></input>}
                {editIState &&
                <p className="[font-family:'Roboto_Condensed',Helvetica] font-normal text-black text-[20px]"> New password </p>}
                {editIState &&
                <input onChange={setNewPassword} className="w-[350px] border border-gray-300 p-1 rounded [font-family:'Roboto_Condensed',Helvetica] font-bold text-black text-[25px]" value = {newPass}></input>}
              </div>

              <div className="flex items-center text-[#5a96f0]">
                {!editIState &&
                <button onClick = {onEditIClick} className="[font-family:'Roboto_Condensed',Helvetica] font-normal text-[23.5px] text-center">
                  Change information
                </button>}
                {!editIState &&
                <PencilIcon onClick={onEditIClick} className="w-6 h-6 ml-2" />}
                {editIState &&
                <Button onClick={onEditIClick} className="mt-5 w-[110px] h-13 rounded-[15px] bg-[#5a96f0] hover:bg-[#4a86e0] transition-colors duration-200 border border-transparent hover:border-white">
                  <span className="[font-family:'Roboto_Condensed',Helvetica] font-normal text-white text-[23.5px]">
                    Confirm
                  </span>
                </Button>}
              </div>
            </div>

            <Separator orientation="vertical" className="mx-8 h-screen" />

            {/* Right section */}
            <div className="flex flex-col mt-8 w-[450px]">
              <div className="flex flex-col h-[350px]">
                <h2 className="[font-family:'Roboto_Condensed',Helvetica] font-bold text-black text-[24px] text-left">
                  Payment method
                </h2>

                <p className="[font-family:'Roboto',Helvetica] font-normal text-black text-xl text-left mt-4">
                  There is nothing here, how about...
                </p>

                <a
                  href="#"
                  className="[font-family:'Roboto_Condensed',Helvetica] font-bold text-[#4285f4] text-[25px] text-right underline mt-8"
                >
                  Add payment method
                </a>
              </div>
              <div className="space-y-2">
                <label className="block [font-family:'Roboto_Condensed',Helvetica] font-normal text-black text-[25px]">
                  Language
                </label>
                <Select defaultValue={localData.language}>
                  <SelectTrigger className="w-[350px] [font-family:'Roboto_Condensed',Helvetica] font-normal text-black text-xl">
                    <SelectValue />
                  </SelectTrigger>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AccountPage;