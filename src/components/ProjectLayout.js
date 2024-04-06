import { useEffect, useState } from "react";
import ProjectsList from "./ProjectsList";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProjectLayout = () => {
  const [groupID, setGroupID] = useState("");
  const [pvtAccessToken, setPvtAccessToken] = useState("");
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [treeObject, setTreeObject] = useState(null);
  const [error, setError] = useState(true);

  // where to where
  const [projectID, setProjectID] = useState("");
  const [targetGroupID, setTargetGroupID] = useState("");
  const [moving, setMoving] = useState(false);

  const handleGetProjects = async (e) => {
    e.preventDefault();

    // check for empty values
    if (!groupID) {
      toast.error("Group ID is required !", {
        position: "top-center",
      });
      return;
    } else if (!pvtAccessToken) {
      toast.error("Private Access Token is required!", {
        position: "top-center",
      });
      return;
    }

    setLoading(true);
    setProjectsLoaded(false);

    // fetch projects
    await fetchGroupTree(groupID, 0, pvtAccessToken)
      .then((response) => {
        console.log(response);
        setTreeObject(response);
        setProjectsLoaded(true);
        setLoading(false);
      })
      .catch((err) => {
        console.log("hERE");
        console.error(err);
        setLoading(true);
        setProjectsLoaded(false);
      });
  };

  const fetchGroupTree = async (groupId, level, pvtAccessToken) => {
    try {
      const groupData = await axios.get(
        `https://gitlab.com/api/v4/groups/${groupId}`,
        {
          headers: {
            "PRIVATE-TOKEN": pvtAccessToken,
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
            "PRIVATE-TOKEN": pvtAccessToken,
          },
        }
      );

      if (subgroupData.data.length > 0) {
        const subgroups = await Promise.all(
          subgroupData.data.map(async (subgroup) => {
            return fetchGroupTree(subgroup.id, level + 1, pvtAccessToken);
          })
        );

        groupInfo.groups = subgroups;
      }

      const projectData = await axios.get(
        `https://gitlab.com/api/v4/groups/${groupId}/projects`,
        {
          headers: {
            "PRIVATE-TOKEN": pvtAccessToken,
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
      setTreeObject(null);
      setProjectsLoaded(false);
      setLoading(false);
      console.error("Error fetching GitLab group tree:", error);
    }
  };

  const handleMoveProject = async (e) => {
    e.preventDefault();

    console.log("Move Project");
    setMoving(true);

    if (!projectID) {
      setMoving(false);
      toast.error("project ID is required !", {
        position: "top-center",
      });
      return;
    } else if (!targetGroupID) {
      setMoving(false);
      toast.error("Target Group ID is required !", {
        position: "top-center",
      });
      return;
    }

    moveProject(projectID, targetGroupID, pvtAccessToken)
      .then(async (response) => {
        console.log(response);
        setMoving(false);
        setProjectID("");
        setTargetGroupID("");

        if (!error) {
          toast.success("Project Moved Successfully!", {
            position: "top-center",
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setMoving(false);
      });
  };

  const moveProject = async (projectId, targetGroupId, pvtAccessToken) => {
    console.log(projectID, targetGroupID, pvtAccessToken);
    // first get the target group namespace
    try {
      const targetGroupData = await axios.get(
        `https://gitlab.com/api/v4/groups/${targetGroupId}`,
        {
          headers: {
            "PRIVATE-TOKEN": pvtAccessToken,
          },
        }
      );
      console.log(targetGroupData.data.full_path);

      if (targetGroupData.data.full_path) {
        try {
          const response = await axios.put(
            `https://gitlab.com/api/v4/projects/${projectId}/transfer`,
            {
              // Request body data here
            },
            {
              params: {
                namespace: targetGroupData.data.full_path,
              },
              headers: {
                "PRIVATE-TOKEN": pvtAccessToken,
              },
            }
          );
          return response;
        } catch (error) {
          setError(true);
          console.error("Error moving project:", error);
          toast.error("Error moving project!", {
            position: "top-center",
          });
        }
      }
    } catch (err) {
      setError(true);
      console.error(err);
      toast.error("Error moving project!", {
        position: "top-center",
      });
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
        <form className="flex justify-center my-4">
          <input
            type="text"
            placeholder="Enter Group ID"
            className="border border-neutral-200 px-3 py-2 rounded-md outline-none"
            value={groupID}
            onChange={(e) => setGroupID(e.target.value)}
          />
          <input
            type="text"
            placeholder="Private Access Token"
            className="border border-neutral-200 px-3 py-2 rounded-md outline-none ml-2 w-80"
            value={pvtAccessToken}
            onChange={(e) => setPvtAccessToken(e.target.value)}
          />
          <button
            className={`bg-blue-700 text-white p-2 rounded-md ml-2 ${
              loading && "cursor-not-allowed bg-blue-300"
            }`}
            onClick={handleGetProjects}
            disabled={loading}
          >
            Fetch Projects
          </button>
        </form>
      </div>

      {/* from where to where */}
      {projectsLoaded && (
        <div>
          <form className="flex justify-center my-4">
            <input
              type="text"
              placeholder="Project ID"
              className="border border-neutral-200 px-3 py-2 rounded-md outline-none"
              value={projectID}
              onChange={(e) => setProjectID(e.target.value)}
            />
            <input
              type="text"
              placeholder="Target Group ID"
              className="border border-neutral-200 px-3 py-2 rounded-md outline-none ml-2 w-80"
              value={targetGroupID}
              onChange={(e) => setTargetGroupID(e.target.value)}
            />
            <button
              className={`bg-blue-700 text-white p-2 rounded-md ml-2 ${
                moving && "cursor-not-allowed bg-blue-300"
              }`}
              onClick={handleMoveProject}
              disabled={moving}
            >
              Move the Project
            </button>
          </form>
        </div>
      )}

      {projectsLoaded && treeObject && !loading && !moving && (
        <ProjectsList treeData={treeObject} />
      )}
      {(loading || moving) && (
        <div className="w-full flex bg-white rounded-md p-6 shadow-md justify-center items-center">
          {/* <h1>Loading Projects...</h1> */}
          <ThreeDots
            visible={true}
            height="48"
            width="48"
            color="rgb(29 78 216)"
            radius="9"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      )}
      {!loading && !projectsLoaded && (
        <div className="w-full flex bg-white rounded-md p-8 shadow-md">
          <h1>Enter Group ID and Click Fetch Projects</h1>
        </div>
      )}
      <ToastContainer />
    </section>
  );
};

export default ProjectLayout;
