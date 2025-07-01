import { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"; // ✅ cập nhật import
import { Button } from "../ui/button.jsx";

function CreateGroupPopup({ isOpen, onClose, onCreate }) {
  const [groupName, setGroupName] = useState("");

  const handleCreate = () => {
    // Chỉ gửi tên nhóm
    onCreate({ name: groupName });
    setGroupName("");
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setGroupName("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center bg-black/30">
      <DialogPanel className="bg-white rounded-lg p-6 w-[400px] shadow-lg">
        <DialogTitle className="text-xl font-bold mb-4">Create new group</DialogTitle>

        <label className="block mb-2 text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md mb-4"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!groupName}>Create</Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

export default CreateGroupPopup;
