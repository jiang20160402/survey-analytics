import { Question } from "survey-core";
import { VisualizerBase } from "./visualizerBase";

declare type VisualizerConstructor = new (
  question: Question,
  data: Array<{ [index: string]: any }>,
  options?: Object
) => any;

export class VisualizationManager {
  static alternativesVisualizer: any = undefined;
  static vizualizers: { [index: string]: Array<VisualizerConstructor> } = {};
  /**
   * Register visualizer (constructor) for question type.
   */
  public static registerVisualizer(
    typeName: string,
    constructor: VisualizerConstructor
  ) {
    let vizualizers = VisualizationManager.vizualizers[typeName];
    if (!vizualizers) {
      vizualizers = [];
      VisualizationManager.vizualizers[typeName] = vizualizers;
    }
    vizualizers.push(constructor);
  }
  /**
   * Get visualizers (constructors) for question type.
   */
  public static getVisualizersByType(typeName: string): VisualizerConstructor[] {
    let vizualizers = VisualizationManager.vizualizers[typeName];
    if (!vizualizers) {
      return [VisualizerBase];
    }
    return vizualizers;
  }
  /**
   * Get visualizers (constructors) for question type.
   */
  public static getAlternativesVisualizer() {
    return VisualizationManager.alternativesVisualizer || VisualizerBase;
  }
  /**
   * Register visualizer (constructor) for question type.
   */
  public static registerAlternativesVisualizer(constructor: any) {
    VisualizationManager.alternativesVisualizer = constructor;
  }
}
