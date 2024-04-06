import React, { useState, useEffect } from "react";
import axios from "axios";
import { BsGitlab } from "react-icons/bs";
import { TbClipboardCopy } from "react-icons/tb";

//  await navigator.clipboard.writeText("navigator.clipboard.writeText()");

const ProjectsList = ({ rootGroupId, setProjectsLoaded }) => {
  //   const [copied, setCopiedId] = useState(false);
  //   const [copiedText, setCopiedText] = useState("");

  const [treeObject, setTreeObject] = useState(null);
  const [openGroups, setOpenGroups] = useState([]);
  const [error, setError] = useState(null);

  //   useEffect(() => {
  //     alert("group ID copied to clipboard");
  //   }, [copied]);

  useEffect(() => {
    if (treeObject) {
      console.log("treeObject ==>", treeObject);
      console.log("Here");
      setProjectsLoaded(true);
    }
  }, [treeObject]);

  useEffect(() => {
    console.log(rootGroupId);
  }, [rootGroupId]);

  useEffect(() => {
    const fetchGroupTree = async (groupId, level) => {
      try {
        const groupData = await axios.get(
          `https://gitlab.com/api/v4/groups/${groupId}`,
          {
            headers: {
              "PRIVATE-TOKEN": "glpat-J7muddu6BuQkVApMDCVx",
            },
          }
        );

        const groupInfo = {
          name: groupData.data.full_path,
          id: groupData.data.id,
          groups: [],
          projects: [],
          level: level,
        };

        const subgroupData = await axios.get(
          `https://gitlab.com/api/v4/groups/${groupId}/subgroups`,
          {
            headers: {
              "PRIVATE-TOKEN": "glpat-J7muddu6BuQkVApMDCVx",
            },
          }
        );

        if (subgroupData.data.length > 0) {
          const subgroups = await Promise.all(
            subgroupData.data.map(async (subgroup) => {
              return fetchGroupTree(subgroup.id, level + 1);
            })
          );

          groupInfo.groups = subgroups;
        }

        const projectData = await axios.get(
          `https://gitlab.com/api/v4/groups/${groupId}/projects`,
          {
            headers: {
              "PRIVATE-TOKEN": "glpat-J7muddu6BuQkVApMDCVx",
            },
          }
        );

        if (projectData.data.length > 0) {
          groupInfo.projects = projectData.data.map((project) => ({
            name: project.name,
            id: project.id,
          }));
        }

        return groupInfo;
      } catch (error) {
        setError("Error fetching GitLab Projects. Please try again...");
        setTreeObject(null);
        console.error("Error fetching GitLab group tree:", error);
      }
    };

    const generateTree = async () => {
      const tree = await fetchGroupTree(rootGroupId, 0);
      setError(null);
      setTreeObject(tree);
    };

    generateTree();
  }, [rootGroupId]);

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
        <ul style={style} className="max-w-max">
          {treeData.groups.map((group, index) => (
            <li key={index}>
              <div className="flex items-center gap-2 my-2 rounded-sm bg-neutral-100 px-3 py-2 justify-between">
                <div className="flex items-center gap-2">
                  <BsGitlab className="text-orange-600" />{" "}
                  <h1
                    onClick={() => toggleGroup(group.id)}
                    className="cursor-pointer hover:text-blue-700 font-semibold"
                  >
                    {group.name}
                  </h1>
                </div>
                <span
                  className="bg-white p-1 rounded-sm ml-3 text-neutral-500 flex gap-1 items-center cursor-pointer hover:text-neutral-700"
                  // onClick={() => {
                  //   navigator.clipboard.writeText(group.id);
                  //   setCopiedId(true);
                  // }}
                >
                  <TbClipboardCopy className="text-neutral-500" /> {group.id}
                </span>
              </div>
              {openGroups.includes(group.id) && renderTree(group)}
            </li>
          ))}
          {treeData.projects.map((project, index) => (
            <li key={index}>
              {project.name} - {project.id}
            </li>
          ))}
        </ul>
      );
    }
  };

  return (
    <div className="w-full flex bg-white rounded-md p-10 shadow-md">
      <div>
        {treeObject !== null ? renderTree(treeObject) : <h1>Loading...</h1>}
      </div>
      {error && <h1>{error}</h1>}
    </div>
  );
};

export default ProjectsList;
