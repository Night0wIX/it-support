import s from "./App.module.css";
import { DataUpload } from "./components/DataUpload/DataUpload";
import { Hero } from "./components/Hero/Hero";
import { Parameters } from "./components/Parameters/Parameters";
import { Results } from "./components/Results/Results";
import { Stepper } from "./components/Stepper/Stepper";
import { Toasts } from "./components/Toasts/Toasts";
import { useClusterWizard } from "./hooks/useClusterWizard";

function getAnimClass(animDir: "next" | "prev"): string {
  return animDir === "prev" ? "slide-from-left" : "slide-from-right";
}

export default function App() {
  const w = useClusterWizard();

  return (
    <div className={s.app}>
      <Hero
        name={w.config?.app.name || "CRM Clustering"}
        version={w.config?.app.version || "1.0.0"}
      />

      <Stepper current={w.step} maxReached={w.maxReached} onNavigate={w.goTo} />

      <Toasts
        error={w.error}
        success={w.success}
        loading={w.loading}
        onClearError={() => w.setError("")}
        onClearSuccess={() => w.setSuccess("")}
      />

      <div className={s.app__wizard}>
        {w.step === 1 && (
          <DataUpload
            dataInfo={w.dataInfo}
            loading={w.loading}
            dragOver={w.dragOver}
            fileRef={w.fileRef}
            onFileUpload={w.handleFileUpload}
            onDrop={w.handleDrop}
            onDragOver={() => w.setDragOver(true)}
            onDragLeave={() => w.setDragOver(false)}
            onGenerate={w.handleGenerate}
            onNext={() => w.goTo(2)}
            animClass={getAnimClass(w.animDir)}
          />
        )}

        {w.step === 2 && w.dataInfo && (
          <Parameters
            config={w.config}
            dataInfo={w.dataInfo}
            selectedFeatures={w.selectedFeatures}
            k={w.k}
            loading={w.loading}
            optimalKResult={w.optimalKResult}
            onToggleFeature={w.toggleFeature}
            onSetK={w.setK}
            onCluster={w.handleCluster}
            onFindOptimalK={w.handleFindOptimalK}
            onBack={() => w.goTo(1)}
            animClass={getAnimClass(w.animDir)}
          />
        )}

        {w.step === 3 && w.clusterResult && (
          <Results
            clusterResult={w.clusterResult}
            optimalKResult={w.optimalKResult}
            selectedFeatures={w.selectedFeatures}
            onBackToParams={() => w.goTo(2)}
            onReset={w.resetAnalysis}
            animClass={getAnimClass(w.animDir)}
          />
        )}
      </div>
    </div>
  );
}
