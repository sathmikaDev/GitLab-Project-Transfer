import { useEffect, useState } from "react";
import ProjectsList from "./ProjectsList";
import axios from "axios";

const ProjectLayout = () => {
  const [groupID, setGroupID] = useState("");
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGetProjects = async (e) => {
    e.preventDefault();
    setLoading(true);

    // fetch projects
    await fetchGroupTree(groupID, 0)
      .then((response) => {
        console.log(response);
        setTreeObject(response);
        setProjectsLoaded(true);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const [treeObject, setTreeObject] = useState(null);
  const [error, setError] = useState(null);

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
        name: groupData.data.name,
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

  return (
    <section className="my-6">
      <div>
        <h1 className="text-center font-medium">
          First, Let's Bring your GitLab Projects Here...
        </h1>
        <p className="text-center">
          Enter Your Root Level Group ID, We'll take care of Rest using REST😉
        </p>
      </div>

      <div>
        <form className="flex justify-center my-6">
          <input
            type="text"
            placeholder="Enter Group ID"
            className="border border-neutral-200 px-3 py-2 rounded-md outline-none"
            value={groupID}
            onChange={(e) => setGroupID(e.target.value)}
          />
          <button
            className={`bg-blue-700 text-white p-2 rounded-md ml-2 ${
              loading && "cursor-not-allowed bg-blue-500"
            }`}
            onClick={handleGetProjects}
            disabled={loading}
          >
            Fetch Projects
          </button>
        </form>
      </div>

      {projectsLoaded && treeObject && !loading && (
        <ProjectsList treeData={treeObject} />
      )}
      {error && !loading && !projectsLoaded && (
        <div className="w-full flex bg-white rounded-md p-8 shadow-md">
          <p className="text-red-500 text-center bg-orange-100 py-1 px-2 rounded-sm">
            {error}
          </p>
        </div>
      )}
      {loading && (
        <div className="w-full flex bg-white rounded-md p-8 shadow-md">
          <h1>Loading Projects...</h1>
        </div>
      )}
      {!loading && !projectsLoaded && !error && (
        <div className="w-full flex bg-white rounded-md p-8 shadow-md">
          <h1>Enter Group ID and Click Fetch Projects</h1>
        </div>
      )}
    </section>
  );
};

export default ProjectLayout;
