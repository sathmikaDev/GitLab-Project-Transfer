import ProjectLayout from "./components/ProjectLayout";

function App() {
  return (
    <div className="h-full bg-neutral-100 py-10 font-primary p-16">
      <h1 className="font-medium text-3xl text-center">
        GitLab Project Transfer😎🚀
      </h1>
      <p className="text-center text-neutral-800 text-base">
        Move Your Projects like a PRO
      </p>
      <div className="lg:px-40">
        <ProjectLayout />
      </div>
    </div>
  );
}

export default App;
