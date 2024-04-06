import { useEffect, useState } from "react";
import ProjectsList from "./ProjectsList";

const ProjectLayout = () => {
  const [groupID, setGroupID] = useState("");
  const [getProjects, setGetProjects] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  const handleGetProjects = (e) => {
    e.preventDefault();
    setGetProjects(true);
  };

  useEffect(() => {
    console.log("projectsLoaded ==>", projectsLoaded);
  }, [projectsLoaded]);

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
              getProjects && !projectsLoaded && "cursor-not-allowed bg-blue-500"
            }`}
            onClick={handleGetProjects}
            disabled={getProjects && !projectsLoaded}
          >
            Fetch Projects
          </button>
        </form>
      </div>

      {getProjects ? (
        <ProjectsList
          rootGroupId={groupID}
          setProjectsLoaded={setProjectsLoaded}
        />
      ) : (
        <div className="w-full flex bg-white rounded-md p-10 shadow-md">
          <h1>Enter Your Group ID...</h1>
        </div>
      )}
    </section>
  );
};

export default ProjectLayout;
