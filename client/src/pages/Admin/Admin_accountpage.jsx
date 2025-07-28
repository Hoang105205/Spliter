import { Camera, BellIcon, ChevronDownIcon, PencilIcon } from "lucide-react"
import InputFile from "../../components/ui/inputfile.jsx"
import React, { useEffect, useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar.jsx"
import { Button } from "../../components/ui/button.jsx"
import { Card, CardContent } from "../../components/ui/card.jsx"
import { Select, SelectTrigger, SelectValue } from "../../components/ui/select.jsx"
import { Separator } from "../../components/ui/seperator.jsx"
import Admin_head_bar from "../../components/ui/admin_headbar.jsx"   

import { useUser } from '../../hooks/useUser.js'

function Admin_accountPage() {
  const { updateUser, handleChangePassword, userData, setUserData, setAvatar, getAvatar } = useUser()
  const [localData, setLocalData] = useState({
    id: '',
    username: '',
    email: '',
    role: '',
    createdAt: '',
    updatedAt: '',
    bio: '',
    phone_number: '',
    avatarURL: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankName: '',
  })

  // Cập nhật localData khi userData thay đổi
  useEffect(() => {
    const updateLocalData = async () => {
      setLocalData({
        id: userData.id || "",
        username: userData.username || "",
        email: userData.email || "",
        role: userData.role || "",
        createdAt: userData.createdAt || "",
        updatedAt: userData.updatedAt || "",
        bio: userData.bio || "",
        phone_number: userData.phone_number || "",
        avatarURL: userData.avatarURL || "",
        bankAccountName: userData.bankAccountName || "",
        bankAccountNumber: userData.bankAccountNumber || "",
        bankName: userData.bankName || "",
      });
    };
    updateLocalData();
  }, [userData]);

  const [editText, setEditText] = useState("Edit")
  var defaultBio = "There is still nothing here, how about you spice something up?"
  
  if (localData.bio !== "") {
    defaultBio = localData.bio
  }
  
  const [editState, setEditState] = useState(false)
  const [editIState, setEditIState] = useState(false)
  const [editPaymentState, setEditPaymentState] = useState(false)
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
      setEditText("Confirm")
      setEditState(true)
    }
  }

  const [showPopup, setShowPopup] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState("")

  // Lấy avatar từ backend khi userId thay đổi
  useEffect(() => {
    let isMounted = true;

    if (userData.id) {
      getAvatar(userData.id).then(url => {
        if (isMounted) {
          setAvatarUrl(url)
        }
      })
    }
    return () => {
      isMounted = false;
    }
    // eslint-disable-next-line
  }, [userData.id])

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      console.error("No file selected")
      return
    }
    try {
      await setAvatar(file)
      // Sau khi upload thành công, lấy lại avatar mới nhất
      if (userData.id) {
        const newUrl = await getAvatar(userData.id)
        setAvatarUrl(newUrl)
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image: " + error.message)
    }
  }

  const [warningCurrentPass, setWarningCurrentPass] = useState("")
  const [warningNewPass, setWarningNewPass] = useState("")

  const onEditPasswordClick = async () => {
    if (editPassword === true) {
      try {
        if (currentPass.trim() === "") {
          setEC(true)
          setWarningCurrentPass("Current password cannot be empty")
        }
        else {
          setEC(false)
          setWarningCurrentPass("")
        }

        if (newPass.trim() === "") {
          setEN(true)
          setWarningNewPass("New password cannot be empty")
          return
        }
        else {
          setEN(false)
          setWarningNewPass("")
        }
        const result = await handleChangePassword(currentPass.trim(), newPass.trim())

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
    return <div>Loading account's information...</div>
  }

  return (
    <main className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-x-hidden w-[1500px] relative py-5">
        <div className="mx-auto w-[1409px] relative">
          {/* Header */}
          <Admin_head_bar />

          {/* Main content */}
          <div className="flex mt-8">
            {/* Left section */}
            <div className="flex flex-col items-center w-[400px]">
              <h1 className="username-header">
                Your Account
              </h1>

              <div className="relative w-[216px] h-[216px]">
                <Avatar className="w-full h-full bg-[#d9d9d9]">
                  <AvatarImage src={avatarUrl || localData.avatarURL} />
                  <AvatarFallback></AvatarFallback>
                </Avatar>

                <button
                  onClick={() => setShowPopup(true)}
                  className="absolute bottom-2 right-2 bg-white hover:bg-gray-100 
                            border border-gray-300 rounded-full p-2 shadow-md">
                  <Camera className="w-5 h-5 text-gray-600" />
                </button>

                {showPopup && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 shadow-xl space-y-5 w-[400px] h-[160px] flex flex-col">
                      <h2 className="font-bold normal-header text-center">Change Avatar</h2>
                      <div className="flex flex-row items-center gap-4">
                        <InputFile
                          onChange={async (e) => {
                            await handleImageChange(e);
                            setShowPopup(false);
                          }}
                          label="Upload image"
                        />
                        <button
                          onClick={() => setShowPopup(false)}
                          className="mx-auto w-[110px] h-12 rounded-[15px] bg-[#5a96f0] hover:bg-[#4a86e0] transition-colors 
                                    duration-200 border border-transparent hover:border-white">
                          <span className="button-blue-data">
                            Cancel
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={onEditBioClick} className="mt-5 w-[110px] h-13 rounded-[15px] bg-[#5a96f0] hover:bg-[#4a86e0]
                                                        transition-colors duration-200 border border-transparent hover:border-white">
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
                  <textarea onChange={setBio} className="resize-none w-[300px] h-[150px] focus:border-0 focus:outline-none
                                                      [font-family:'Roboto_Condensed',Helvetica] font-normal text-[#b3b3b3] text-base" 
                                              value = {localData.bio}
                                              placeholder = {"There is still nothing here, how about you spice something up?"}>
                  </textarea>}
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
                      <input onChange={setNewPassword} className={errorNew ? "error-input" : "normal-input"} value = {newPass}></input>}
                      {!editIState && editPassword &&
                      <p className="error-text min-h-[20px]"> {warningNewPass} </p>}
                    </div>

                    <div className="flex gap-x-6">
                      {editPassword &&
                      <Button onClick={onEditPasswordClick} className="w-[110px] h-13 rounded-[15px] bg-[#5a96f0] hover:bg-[#4a86e0]
                                                                    transition-colors duration-200 border border-transparent hover:border-white">
                        <span className="button-blue-data">
                          Confirm
                        </span>
                      </Button>}
                      {editPassword &&
                      <Button onClick={() => {setEditPassword(false)}} className="w-[110px] h-13 rounded-[15px] bg-[#5a96f0] hover:bg-[#4a86e0]
                                                                    transition-colors duration-200 border border-transparent hover:border-white">
                        <span className="button-blue-data">
                          Cancel
                        </span>
                      </Button>}
                    </div>
                  </div>    
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Admin_accountPage