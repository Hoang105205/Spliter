import { BellIcon, ChevronDownIcon, PencilIcon } from "lucide-react"
import React, { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "../../components/ui/avatar.jsx"
import { Button } from "../../components/ui/button.jsx"
import { Card, CardContent } from "../../components/ui/card.jsx"
import { Select, SelectTrigger, SelectValue } from "../../components/ui/select.jsx"
import { Separator } from "../../components/ui/seperator.jsx"
import Head_bar from "../../components/ui/headbar.jsx"   

import { useUser } from '../../hooks/useUser.js'

function AccountPage() {
  const { updateUser, handleChangePassword, userData, setUserData } = useUser()
  const [localData, setLocalData] = useState({
    id: '',
    username: '',
    email: '',
    role: '',
    createdAt: '',
    updatedAt: '',
    bio: '',
    phone_number: '',
  })

  useEffect(() => {
    // When the component mounts, fetch the user data
    setLocalData({
      id: userData.id || '',
      username: userData.username || '',
      email: userData.email || '',
      role: userData.role || '',
      createdAt: userData.createdAt || '',
      updatedAt: userData.updatedAt || '',
      bio: userData.bio || '',
      phone_number: userData.phone_number || ''
    })
  }, [userData])

  const [editText, setEditText] = useState("Edit")
  var defaultBio = "There is still nothing here, how about you spice something up?"
  
  if (localData.bio !== "") {
    defaultBio = localData.bio
  }

  const [editState, setEditState] = useState(false)
  const [editIState, setEditIState] = useState(false)
  const [editPassword, setEditPassword] = useState(false)
  const [errorCurrent, setEC] = useState(false)
  const [errorNew, setEN] = useState(false)
  const [currentPass, setCurrentPass] = useState("")
  const [newPass, setNewPass] = useState("")

  const onEditBioClick = async () => {
    if (editState === true) {
      setEditText("Edit")
      try {
        await updateUser({ id: localData.id, bio: localData.bio }) // chỉ gửi id và bio
        setEditState(false) // exit edit mode after success
      } catch (error) {
        alert("Failed to update bio " + error)
      }
    }
    else {
      setEditText("Comfirm")
      setEditState(true)
    }
  }

  const [warningCurrentPass, setWarningCurrentPass] = useState("")
  const [warningNewPass, setWarningNewPass] = useState("")

  const onEditPasswordClick = async () => {
    if (editPassword === true) {
      try {
        if (!currentPass) {
          setEC(true)
          setWarningCurrentPass("Current password cannot be empty")
        }
        else {
          setWarningCurrentPass("")
        }

        if (!newPass) {
          setEN(true)
          setWarningNewPass("New password cannot be empty")
          return
        }
        else {
          setWarningNewPass("")
        }
        const result = await handleChangePassword(currentPass, newPass)

        alert(result.message)
        setEditPassword(false)
        setEC(false)
        setEN(false)
      } catch (error) {
        console.log(error)
        const errorMessage = error?.response?.data?.message || error?.response?.data || error.message

        if (typeof errorMessage === "string" && errorMessage.includes("Current password")) {
          setEC(true)
          setWarningCurrentPass("Password does not match")
        } else {
          alert("Failed to change password: " + errorMessage)
        }
      }
    } else {
      setEditPassword(true)
      setEC(false)
      setEN(false)
      setWarningCurrentPass("")
      setWarningNewPass("")
      setCurrentPass("")
      setNewPass("")
    }
  }

  const onEditIClick = async () => {
    if (editIState === true) {
      try {
        await updateUser(
          {
            id: localData.id,
            username: localData.username,
            email: localData.email,
            phone_number: localData.phone_number,
          }
        ) // update on server
        setEditIState(false)        // exit edit mode after success
      } catch (error) {
        alert("Failed to change user's data " + error)
      }
    } else {
      setEditIState(true) // enter edit mode
    }
  }
  
  const setBio = (event) => {
    setLocalData({
      ...localData,
      bio: event.target.value,
    })
  }

  const setName = (event) => {
    setLocalData({
      ...localData,
      username: event.target.value,
    })
  }

  const setEmail = (event) => {
    setLocalData({
      ...localData,
      email: event.target.value,
    })
  }

  const setPhone = (event) => {
    setLocalData({
      ...localData,
      phone_number: event.target.value,
    })
  }

  const setCurrentPassword = (event) => {
    setCurrentPass(event.target.value)
  }

  const setNewPassword = (event) => {
    setNewPass(event.target.value)
  }

  if (!userData) {
    // Đợi dữ liệu, render loading
    return <div>Đang tải dữ liệu tài khoản...</div>
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

              <Button onClick={onEditBioClick} className="mt-5 w-[110px] h-13 rounded-[15px] bg-[#5a96f0] hover:bg-[#4a86e0] transition-colors duration-200 border border-transparent hover:border-white">
                <span className="button-blue-data">
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
            <div className="flex flex-col w-[350px] ml-16 space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="normal-header">
                    Your name
                  </label>
                  {!editIState && 
                  <p className="normal-data min-h-[30px]">
                    {localData.username}
                  </p>}
                  {editIState && <input onChange={setName} className="normal-input" value = {localData.username}></input>}
                </div>

                <div className="space-y-2">
                  <label className="normal-header">
                    Your email address
                  </label>
                  {!editIState && 
                  <p className="normal-data min-h-[30px]">
                    {localData.email}
                  </p>}
                  {editIState && <input onChange={setEmail} className="normal-input" value = {localData.email}></input>}
                </div>

                <div className="space-y-1">
                  <label className="normal-header">
                    Your phone number
                  </label>
                  {!editIState &&
                  <p className="normal-data min-h-[30px]">
                    {localData.phone_number}
                  </p>}
                  {editIState && <input onChange={setPhone} className="normal-input" value = {localData.phone_number}></input>}
                </div>

                <div className="flex items-center text-[#5a96f0]">
                  {!editIState && !editPassword &&
                  <button onClick = {onEditIClick} className="data">
                    Change information
                  </button>}
                  {!editIState && !editPassword &&
                  <PencilIcon onClick={onEditIClick} className="w-6 h-6 ml-2" />}
                  {editIState &&
                  <Button onClick={onEditIClick} className="mt-5 w-[110px] h-13 rounded-[15px] bg-[#5a96f0] hover:bg-[#4a86e0] transition-colors duration-200 border border-transparent hover:border-white">
                    <span className="button-blue-data">
                      Confirm
                    </span>
                  </Button>}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 pd-[35px]">
                  {!editIState &&
                  <label className="normal-header">
                    Your password
                  </label>}

                  {!editIState && !editPassword &&
                  <p className="normal-data">
                    *****************
                  </p>}

                  <div className="flex items-center text-[#5a96f0]">
                    {!editIState && !editPassword &&
                    <button onClick = {onEditPasswordClick} className="data">
                      Change password
                    </button>}
                    {!editIState && !editPassword &&
                    <PencilIcon onClick={onEditPasswordClick} className="w-6 h-6 ml-2" />}
                  </div>

                  <div className="space-y-2">
                    <div>
                      {!editIState && editPassword &&
                      <p className="normal-input-header"> Current password </p>}
                      {!editIState && editPassword &&
                      <input onChange={setCurrentPassword} className={errorCurrent ? "error-input" : "normal-input"} value = {currentPass}></input>}
                      {!editIState && editPassword &&
                      <p className="error-text min-h-[20px]"> {warningCurrentPass} </p>}
                    </div>

                    <div>
                      {!editIState && editPassword &&
                      <p className="normal-input-header"> New password </p>}
                      {!editIState && editPassword &&
                      <input onChange={setNewPassword} className={errorCurrent ? "error-input" : "normal-input"} value = {newPass}></input>}
                      {!editIState && editPassword &&
                      <p className="error-text min-h-[20px]"> {warningNewPass} </p>}
                    </div>

                    <div className="flex gap-x-6">
                      {editPassword &&
                      <Button onClick={onEditPasswordClick} className="w-[110px] h-13 rounded-[15px] bg-[#5a96f0] hover:bg-[#4a86e0] transition-colors duration-200 border border-transparent hover:border-white">
                        <span className="button-blue-data">
                          Confirm
                        </span>
                      </Button>}
                      {editPassword &&
                      <Button onClick={() => {setEditPassword(false)}} className="w-[110px] h-13 rounded-[15px] bg-[#5a96f0] hover:bg-[#4a86e0] transition-colors duration-200 border border-transparent hover:border-white">
                        <span className="button-blue-data">
                          Cancel
                        </span>
                      </Button>}
                    </div>
                  </div>    
                </div>
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
                  className="[font-family:'Roboto_Condensed',Helvetica] font-bold text-[#4285f4] text-[25px] text-right underline mt-8">
                  Add payment method
                </a>
              </div>
              <div className="space-y-2">
                <label className="normal-header">
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
  )
}

export default AccountPage