import React, { Component } from "react";
import NavigationBar from "./view/components/navigation/NavigationBar";
import "./App.css";
import "bulma/css/bulma.min.css";
import "bulma-switch/dist/css/bulma-switch.min.css";
import GroupedData from "./models/GroupedData";
import ImportationPage from "./view/pages/importation/ImportationPage";
import PagesView from "./models/PageViews";
import HistoryPage from "./view/pages/history/HistoryPage";
import {
  getStoredAppHistory,
  addMeasurerToHistory,
  getStoredAppConfiguration,
  resetScrollPositions,
} from "./helpers/LocalStorageHelper";
import RawDatePage from "./view/pages/raw-data/RawDataPage";
import ReportPage from "./view/pages/report/ReportPage";
import UpdateNotification from "./view/components/notification/Notification";
import * as serviceWorker from "./serviceWorker";
import HelpPage from "./view/pages/help/HelpPage";

interface AppState {
  currentPage: PagesView;
  currentModel?: GroupedData;
  isFullScreen: boolean;
  useErrorForReferential: boolean;
  displayConditionnalFormatting: boolean;
  selectedGroup?: string;
  updateAvalaible?: boolean;
  hideUpdate: boolean;
  isUpdating: boolean;
  serviceWorker?: ServiceWorker | null;
}

class App extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      currentPage: PagesView.IMPORT,
      isFullScreen: false,
      useErrorForReferential: true,
      displayConditionnalFormatting: true,
      hideUpdate: false,
      isUpdating: false,
    };

    serviceWorker.register({
      onUpdate: (serviceWorkerResistration) => {
        this.setState({
          updateAvalaible: true,
          serviceWorker: serviceWorkerResistration.waiting,
        });
      },
    });
  }

  handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      this.setState({ isFullScreen: false });
    } else {
      document.documentElement.requestFullscreen();
      this.setState({ isFullScreen: true });
    }
  };

  handleGroupedDataImport = (model: GroupedData) => {
    resetScrollPositions();
    
    this.setState({
      currentModel: model,
      currentPage: PagesView.RAW,
      selectedGroup: undefined,
    });
  };

  handleIgnoreMeasure = (groupName: string, measureId: number) => {
    const model = this.state.currentModel;

    if (!model) {
      return;
    }

    const groupIndex = model.measuresGroups.findIndex(
      (group) => group.name === groupName
    );
    const measureIndex = model.measuresGroups[groupIndex]?.measures.findIndex(
      (measure) => measure.id === measureId
    );

    if (groupIndex === -1 || measureIndex === -1) {
      return;
    }

    const currentValue = !!model.measuresGroups[groupIndex].measures[
      measureIndex
    ].ignored;

    this.setState((previousState) => {
      let currentModel = Object.assign({}, previousState.currentModel);
      currentModel.measuresGroups[groupIndex].measures[
        measureIndex
      ].ignored = !currentValue;
      addMeasurerToHistory(currentModel);
      return { currentModel: currentModel };
    });
  };

  handleReloadApp = () => {
    this.setState({ isUpdating: true });
    this.state.serviceWorker?.postMessage({ type: "SKIP_WAITING" });
    this.state.serviceWorker?.addEventListener("statechange", (e) => {
      const eventTager = e.target as ServiceWorker;
      if (eventTager.state === "activated") {
        this.setState({ isUpdating: false });
        window.location.reload(true);
      }
    });
  };

  render() {
    return (
      <div id="application">
        <NavigationBar
          onPageSelected={(page) => this.setState({ currentPage: page })}
          onFullscreen={this.handleFullscreen}
          isFullscreenEnabled={this.state.isFullScreen}
          enableDataAndReport={!!this.state.currentModel}
          currentPage={this.state.currentPage}
        />
        <section className="main-container">
          <article className="page-content">{this.generateContent()}</article>
        </section>
        {this.state.updateAvalaible && !this.state.hideUpdate && (
          <UpdateNotification
            isUpdating={this.state.isUpdating}
            onClose={() => this.setState({ hideUpdate: true })}
            onRefresh={this.handleReloadApp}
          />
        )}
      </div>
    );
  }

  generateContent = () => {
    switch (this.state.currentPage) {
      case PagesView.IMPORT:
        return <ImportationPage onImportDate={this.handleGroupedDataImport} />;
      case PagesView.HISTORY:
        return (
          <HistoryPage
            onImportModel={this.handleGroupedDataImport}
            history={getStoredAppHistory()}
          />
        );
      case PagesView.RAW:
        return (
          <RawDatePage
            groupedData={this.state.currentModel}
            defaultSelectedGroup={this.state.selectedGroup}
            onIgnoreMeasure={this.handleIgnoreMeasure}
            onSelectGroup={(group) => this.setState({ selectedGroup: group })}
          />
        );
      case PagesView.REPORT:
        const configuration = getStoredAppConfiguration();
        return (
          <ReportPage
            useErrorForReferential={this.state.useErrorForReferential}
            displayConditionnalFormatting={this.state.displayConditionnalFormatting}
            appConfiguration={configuration}
            groupedData={this.state.currentModel}
            onUseErrorForReferencial={() =>
              this.setState({
                useErrorForReferential: !this.state.useErrorForReferential,
              })
            }
            onUseConditionnalFormatting={() =>
              this.setState({
                displayConditionnalFormatting: !this.state.displayConditionnalFormatting,
              })
            }
          />
        );
      case PagesView.HELP:
        return <HelpPage/>
      default:
        return <p>Not Implemented Yet !</p>;
    }
  };
}

export default App;
