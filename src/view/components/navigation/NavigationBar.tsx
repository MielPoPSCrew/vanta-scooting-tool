import React from "react";
import "./NavigationBar.css";
import PagesView from "../../../models/PageViews";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCompress,
  faExpand,
  faVials,
  faHistory,
  faUpload,
  faFileInvoice,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";

interface NavigationBarProps {
  onPageSelected: (page: PagesView) => void;
  onFullscreen: () => void;
  enableDataAndReport: boolean;
  isFullscreenEnabled: boolean;
  currentPage: PagesView;
}

function NavigationBar(props: NavigationBarProps) {
  return (
    <nav>
      <div className="left">
        <div className="field has-addons buttons are-large">
          <p className="control">
            <button
              className={
                "button " +
                (props.currentPage === PagesView.IMPORT ? "is-success" : "")
              }
              onClick={() => props.onPageSelected(PagesView.IMPORT)}
            >
              <span className="icon is-small">
                <FontAwesomeIcon icon={faUpload} />
              </span>
              <span>Importer</span>
            </button>
          </p>
          <p className="control">
            <button
              className={
                "button " +
                (props.currentPage === PagesView.HISTORY ? "is-success" : "")
              }
              onClick={() => props.onPageSelected(PagesView.HISTORY)}
            >
              <span className="icon is-small">
                <FontAwesomeIcon icon={faHistory} />
              </span>
            </button>
          </p>
        </div>
      </div>
      <div className="center">
        <div className="field has-addons buttons are-large">
          <p className="control">
            <button
              className={
                "button " +
                (props.currentPage === PagesView.RAW ? "is-success" : "")
              }
              onClick={() => props.onPageSelected(PagesView.RAW)}
              disabled={!props.enableDataAndReport}
            >
              <span className="icon is-small">
                <FontAwesomeIcon icon={faVials} />
              </span>
              <span>Données brutes</span>
            </button>
          </p>
          <p className="control">
            <button
              className={
                "button " +
                (props.currentPage === PagesView.REPORT ? "is-success" : "")
              }
              onClick={() => props.onPageSelected(PagesView.REPORT)}
              disabled={!props.enableDataAndReport}
            >
              <span className="icon is-small">
                <FontAwesomeIcon icon={faFileInvoice} />
              </span>
              <span>Rapport</span>
            </button>
          </p>
        </div>
      </div>
      <div className="right">
        <div className="buttons are-large">
          <button className="button" onClick={props.onFullscreen}>
            <span className="icon is-small">
              <FontAwesomeIcon
                icon={props.isFullscreenEnabled ? faCompress : faExpand}
              />
            </span>
          </button>
          {
            <button
            className={
              "button " +
              (props.currentPage === PagesView.HELP ? "is-success" : "")
            }
              onClick={() => props.onPageSelected(PagesView.HELP)}
            >
              <span className="icon is-small">
                <FontAwesomeIcon icon={faQuestionCircle} />
              </span>
            </button>
          }
        </div>
      </div>
    </nav>
  );
}

export default NavigationBar;
