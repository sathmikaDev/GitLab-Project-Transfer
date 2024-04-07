import React, { useState } from "react";
import { BsGitlab } from "react-icons/bs";
import { TbClipboardCopy } from "react-icons/tb";
import { HiMiniCodeBracketSquare } from "react-icons/hi2";
import { MdExpandMore } from "react-icons/md";

//  await navigator.clipboard.writeText("navigator.clipboard.writeText()");

const ProjectsList = ({ treeData }) => {
  //   const [copied, setCopiedId] = useState(false);
  //   const [copiedText, setCopiedText] = useState("");

  const [openGroups, setOpenGroups] = useState([]);

  const toggleGroup = (groupId) => {
    if (openGroups.includes(groupId)) {
      setOpenGroups(openGroups.filter((id) => id !== groupId));
    } else {
      setOpenGroups([...openGroups, groupId]);
    }
  };

  const renderTree = (treeData) => {
    if (treeData) {
      const paddingLeft = treeData.level * 20; // Adjust the indentation level as needed
      const style = { paddingLeft: `${paddingLeft}px` };
      return (
        <ul style={style}>
          {treeData.groups.map((group, index) => (
            <li key={index} className="w-full">
              <div className="flex items-center gap-2 my-2 rounded-sm bg-neutral-100 px-3 py-1 justify-between w-full">
                <div className="flex items-center gap-2">
                  <BsGitlab className="text-orange-600" />{" "}
                  <h1 className="cursor-pointer hover:text-blue-700 font-semibold">
                    {group.name}
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className="bg-white p-1 rounded-sm ml-3 text-neutral-500 flex gap-1 items-center cursor-pointer hover:text-neutral-700"
                    // onClick={() => {
                    //   navigator.clipboard.writeText(group.id);
                    //   setCopiedId(true);
                    // }}
                  >
                    <TbClipboardCopy className="text-neutral-500" /> {group.id}
                  </span>
                  <MdExpandMore
                    onClick={() => toggleGroup(group.id)}
                    className="cursor-pointer text-blue-500 hover:text-blue-700 hover:bg-neutral-200 hover:rounded-sm text-xl transition-all duration-300"
                  />
                </div>
              </div>
              {openGroups.includes(group.id) && renderTree(group)}
            </li>
          ))}
          {treeData.projects.map((project, index) => (
            <li
              key={index}
              className="flex items-center justify-between bg-blue-50 py-1 px-2 w-full my-2"
            >
              <div className="flex items-center gap-2">
                <HiMiniCodeBracketSquare className="text-gray-700" />
                <h1
                  // onClick={() => toggleGroup(group.id)}
                  className="cursor-pointer hover:text-blue-700 font-semibold"
                >
                  {project.name}
                </h1>
              </div>
              <span
                className="bg-white p-1 rounded-sm ml-3 text-neutral-500 flex gap-1 items-center cursor-pointer hover:text-neutral-700"
                // onClick={() => {
                //   navigator.clipboard.writeText(group.id);
                //   setCopiedId(true);
                // }}
              >
                <TbClipboardCopy className="text-neutral-500" /> {project.id}
              </span>
            </li>
          ))}
        </ul>
      );
    }
  };

  return (
    <div className="flex bg-white rounded-md p-10 shadow-md">
      <div className="w-full">
        {treeData !== null ? renderTree(treeData) : <h1>Loading...</h1>}
      </div>
    </div>
  );
};

export default ProjectsList;
