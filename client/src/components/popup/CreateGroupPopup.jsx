import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "../ui/button.jsx";

function CreateGroupPopup({ isOpen, onClose, onCreate }) {
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState(null);

  const handleImageChange = (e) => {
    setGroupImage(e.target.files[0]);
  };

  const handleCreate = () => {
    // Gửi data về cha
    onCreate({ name: groupName, image: groupImage });
    setGroupName("");
    setGroupImage(null);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setGroupName("");
      setGroupImage(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center bg-black/30">
      <Dialog.Panel className="bg-white rounded-lg p-6 w-[400px] shadow-lg">
        <Dialog.Title className="text-xl font-bold mb-4">Create new group</Dialog.Title>

        <label className="block mb-2 text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md mb-4"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">Avartar</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-4"
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!groupName}>Create</Button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}

export default CreateGroupPopup;
