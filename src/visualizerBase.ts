import { Question, QuestionCommentModel, settings } from "survey-core";
import { IDataInfo, DataProvider } from "./dataProvider";
import { VisualizerFactory } from "./visualizerFactory";
import { DocumentHelper } from "./utils";
import { localization } from "./localizationManager";

import "./visualizerBase.scss";

export class VisualizerBase implements IDataInfo {
  private _showHeader = true;
  private _footerVisualizer: VisualizerBase = undefined;
  private _dataProvider: DataProvider = undefined;
  protected renderResult: HTMLElement = undefined;
  protected toolbarContainer: HTMLElement = undefined;
  protected contentContainer: HTMLElement = undefined;
  protected footerContainer: HTMLElement = undefined;
  // public static otherCommentQuestionType = "comment"; // TODO: make it configureable - allow choose what kind of question/visualizer will be used for comments/others
  public static otherCommentCollapsed = true;

  protected toolbarItemCreators: {
    [name: string]: (toolbar?: HTMLDivElement) => HTMLElement;
  } = {};

  constructor(
    public question: Question,
    data: Array<{ [index: string]: any }>,
    protected options: { [index: string]: any } = {},
    private _name?: string
  ) {
    this._dataProvider = options.dataProvider || new DataProvider(data);
    this._dataProvider.onDataChanged.add(() => this.onDataChanged());
  }

  protected onDataChanged() {
    this.refresh();
  }

  get dataName(): string {
    return this.question.name;
  }

  get hasFooter() {
    return (
      !!this.question && (this.question.hasComment || this.question.hasOther)
    );
  }

  protected createVisualizer(question: Question) {
    let options = Object.assign({}, this.options);
    if (options.dataProvider === undefined) {
      options.dataProvider = this.dataProvider;
    }

    return VisualizerFactory.createVisualizer(question, this.data, options);
  }

  get footerVisualizer() {
    if (!this.hasFooter) {
      return undefined;
    }
    if (!this._footerVisualizer) {
      const question = new QuestionCommentModel(
        this.question.name + (settings || {}).commentPrefix
      );
      question.title = this.question.title;

      this._footerVisualizer = this.createVisualizer(question);
      this._footerVisualizer.onUpdate = () => this.invokeOnUpdate();
    }
    return this._footerVisualizer;
  }

  getSeriesValues(): Array<string> {
    return this.options.seriesValues || [];
  }

  getSeriesLabels(): Array<string> {
    return this.options.seriesLabels || this.getSeriesValues();
  }

  getValues(): Array<any> {
    throw new Error("Method not implemented.");
  }

  getLabels(): Array<string> {
    return this.getValues();
  }

  public registerToolbarItem(
    name: string,
    creator: (toolbar?: HTMLDivElement) => HTMLElement
  ) {
    this.toolbarItemCreators[name] = creator;
  }

  public get name() {
    return this._name || "visualizer";
  }

  protected get data() {
    return this.dataProvider.filteredData;
  }

  protected get dataProvider(): DataProvider {
    return this._dataProvider;
  }

  /**
   * Updates visualizer data.
   */
  updateData(data: Array<{ [index: string]: any }>) {
    if (!this.options.dataProvider) {
      this.dataProvider.data = data;
    }
    if (this.hasFooter) {
      this.footerVisualizer.updateData(data);
    }
  }

  onUpdate: () => void;

  invokeOnUpdate() {
    this.onUpdate && this.onUpdate();
  }

  destroy() {
    if (!!this.renderResult) {
      this.destroyToolbar(this.toolbarContainer);
      this.toolbarContainer = undefined;
      this.destroyContent(this.contentContainer);
      this.contentContainer = undefined;
      this.destroyFooter(this.footerContainer);
      this.footerContainer = undefined;
      this.renderResult.innerHTML = "";
      this.renderResult = undefined;
    }
    if (!!this._footerVisualizer) {
      this._footerVisualizer.destroy();
      this._footerVisualizer.onUpdate = undefined;
      this._footerVisualizer = undefined;
    }
  }

  protected createToolbarItems(toolbar: HTMLDivElement) {
    Object.keys(this.toolbarItemCreators || {}).forEach((toolbarItemName) => {
      let toolbarItem = this.toolbarItemCreators[toolbarItemName](toolbar);
      if (!!toolbarItem) {
        toolbar.appendChild(toolbarItem);
      }
    });
  }

  protected destroyToolbar(container: HTMLElement) {
    container.innerHTML = "";
  }

  protected renderToolbar(container: HTMLElement) {
    if (this.showHeader) {
      const toolbar = <HTMLDivElement>(
        DocumentHelper.createElement("div", "sa-toolbar")
      );
      this.createToolbarItems(toolbar);
      container.appendChild(toolbar);
    }
  }

  protected destroyContent(container: HTMLElement) {
    if (!!this.options && typeof this.options.destroyContent === "function") {
      this.options.destroyContent(container, this);
    } else {
      container.innerHTML = "";
    }
  }

  protected renderContent(container: HTMLElement) {
    if (!!this.options && typeof this.options.renderContent === "function") {
      this.options.renderContent(container, this);
    } else {
      container.innerHTML = "This question type is not visualized yet";
    }
  }

  protected destroyFooter(container: HTMLElement) {
    container.innerHTML = "";
  }

  protected renderFooter(container: HTMLElement) {
    container.innerHTML = "";
    if (this.hasFooter) {
      const footerTitleElement = DocumentHelper.createElement(
        "h4",
        "sa-visualizer__footer-title",
        { innerText: localization.getString("otherCommentTitle") }
      );
      container.appendChild(footerTitleElement);

      const footerContentElement = DocumentHelper.createElement(
        "div",
        "sa-visualizer__footer-content"
      );
      footerContentElement.style.display = VisualizerBase.otherCommentCollapsed
        ? "none"
        : "block";

      const visibilityButton = DocumentHelper.createButton(() => {
        if (footerContentElement.style.display === "none") {
          footerContentElement.style.display = "block";
          visibilityButton.innerText = localization.getString("hideButton");
        } else {
          footerContentElement.style.display = "none";
          visibilityButton.innerText = localization.getString(
            VisualizerBase.otherCommentCollapsed ? "showButton" : "hideButton"
          );
        }
        this.footerVisualizer.invokeOnUpdate();
      }, localization.getString("showButton") /*, "sa-toolbar__button--right"*/);
      container.appendChild(visibilityButton);

      container.appendChild(footerContentElement);

      this.footerVisualizer.render(footerContentElement);
    }
  }

  render(targetElement: HTMLElement) {
    this.renderResult = targetElement;

    this.toolbarContainer = DocumentHelper.createElement(
      "div",
      "sa-visualizer__toolbar"
    );
    targetElement.appendChild(this.toolbarContainer);
    this.renderToolbar(this.toolbarContainer);

    this.contentContainer = DocumentHelper.createElement(
      "div",
      "sa-visualizer__content"
    );
    targetElement.appendChild(this.contentContainer);
    this.renderContent(this.contentContainer);

    this.footerContainer = DocumentHelper.createElement(
      "div",
      "sa-visualizer__footer"
    );
    targetElement.appendChild(this.footerContainer);
    this.renderFooter(this.footerContainer);
  }

  /**
   * Redraws visualizer and all inner content.
   */
  public refresh() {
    if (!!this.contentContainer) {
      setTimeout(() => {
        this.destroyContent(this.contentContainer);
        this.renderContent(this.contentContainer);
        this.invokeOnUpdate();
      });
    }
    if (!!this.footerContainer) {
      setTimeout(() => {
        this.destroyFooter(this.footerContainer);
        this.renderFooter(this.footerContainer);
        this.invokeOnUpdate();
      });
    }
  }

  getRandomColor() {
    const colors = this.getColors();
    return colors[Math.floor(Math.random() * colors.length)];
  }

  backgroundColor = "#f7f7f7";

  static customColors: string[] = [];
  private static colors = [
    "#86e1fb",
    "#3999fb",
    "#ff6771",
    "#1eb496",
    "#ffc152",
    "#aba1ff",
    "#7d8da5",
    "#4ec46c",
    "#cf37a6",
    "#4e6198",
  ];

  getColors(count = 10) {
    const colors =
      Array.isArray(VisualizerBase.customColors) &&
      VisualizerBase.customColors.length > 0
        ? VisualizerBase.customColors
        : VisualizerBase.colors;

    let manyColors: any = [];

    for (let index = 0; index < count; index++) {
      manyColors = manyColors.concat(colors);
    }

    return manyColors;
  }

  get showHeader() {
    return this._showHeader;
  }
  set showHeader(newValue: boolean) {
    if (newValue != this._showHeader) {
      this._showHeader = newValue;
      if (!!this.toolbarContainer) {
        this.destroyToolbar(this.toolbarContainer);
        this.renderToolbar(this.toolbarContainer);
      }
    }
  }

  getData(): any {
    return this.dataProvider.getData(this);
  }
}
