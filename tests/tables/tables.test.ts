import { SurveyModel, Question } from "survey-core";
import { Table } from "../../src/tables/table";
import {
  ColumnDataType,
  ColumnVisibility,
  QuestionLocation,
  ITableState,
} from "../../src/tables/config";

const json = {
  questions: [
    {
      type: "radiogroup",
      name: "car",
      title: "What car are you driving?",
      isRequired: true,
      colCount: 4,
      choices: ["None", "Ford", "Vauxhall"],
    },
    {
      type: "file",
      name: "photo",
    },
  ],
};

class TableTest extends Table {
  applyColumnFilter() {}
  applyFilter() {}
  render() {}
  sortByColumn() {}
}

test("buildColumns method", () => {
  const survey = new SurveyModel(json);
  const tables = new TableTest(survey, [], null, [], false);

  const columns = <any>tables["buildColumns"](survey);

  expect(JSON.stringify(columns)).toBe(
    '[{"name":"car","displayName":"What car are you driving?","dataType":0,"visibility":0,"location":0},{"name":"photo","displayName":"photo","dataType":1,"visibility":1,"location":0}]'
  );
});

test("isVisible method", () => {
  let tables = new TableTest(new SurveyModel(), [], null, [], false);
  expect(tables.isVisible(ColumnVisibility.Invisible)).toBeFalsy();
  expect(tables.isVisible(ColumnVisibility.PublicInvisible)).toBeFalsy();
  expect(tables.isVisible(ColumnVisibility.Visible)).toBeTruthy();

  tables = new TableTest(new SurveyModel(), [], null, [], true);
  expect(tables.isVisible(ColumnVisibility.Invisible)).toBeFalsy();
  expect(tables.isVisible(ColumnVisibility.PublicInvisible)).toBeTruthy();
  expect(tables.isVisible(ColumnVisibility.Visible)).toBeTruthy();
});

test("buildColumns method", () => {
  const survey = new SurveyModel(json);
  const tables = new TableTest(survey, [], null, [], false);

  expect(tables.locale).toBe("");
  tables.locale = "ru";
  expect(tables.locale).toBe("ru");
});

test("get/set permissions, onPermissionsChangedCallback", () => {
  let tables = new TableTest(new SurveyModel(json), [], null, [], false);
  let count = 0;

  const p = tables.permissions;
  tables.permissions = p;

  tables.onPermissionsChangedCallback = () => {
    count++;
  };

  expect(tables.permissions[0].name).toEqual("car");
  expect(tables.permissions[0].visibility).toEqual(0);

  const newPermissions = tables.permissions;
  newPermissions[0].visibility = 2;

  tables.permissions = newPermissions;

  expect(count).toEqual(1);
  expect(tables.permissions[0].visibility).toEqual(2);
});

test("getState, setState, onStateChanged", () => {
  let tables = new TableTest(new SurveyModel(), [], null, [], false);

  let initialState: ITableState = {
    locale: "",
    elements: [],
    pageSize: 5,
  };
  let newState: ITableState = {
    locale: "fr",
    elements: [],
    pageSize: 5,
  };
  let count = 0;

  tables.onStateChanged.add(() => {
    count++;
  });

  expect(tables.state).toEqual(initialState);

  tables.state = newState;
  expect(tables.state).toEqual(newState);
  expect(count).toBe(0);

  tables.locale = "ru";
  expect(count).toBe(1);
  expect(tables.state.locale).toEqual("ru");
});

test("test getAvailableColumns method", () => {
  var table = new TableTest(new SurveyModel(), [], null, [], false);
  table.columns = [
    {
      name: "visible",
      displayName: "visible",
      dataType: 0,
      visibility: 0,
      location: 0,
    },
    {
      name: "invisible",
      displayName: "invisible",
      dataType: 0,
      visibility: 1,
      location: 0,
    },
    {
      name: "publicinvisible",
      displayName: "publicinvisible",
      dataType: 0,
      visibility: 2,
      location: 0,
    },
  ];
  var columnNames = table.getAvailableColumns().map((column) => column.name);
  expect(columnNames).toEqual(["visible", "invisible"]);
  table.isTrustedAccess = true;
  columnNames = table.getAvailableColumns().map((column) => column.name);
  expect(columnNames).toEqual(["visible", "invisible", "publicinvisible"]);
});

test("move column method", () => {
  var table = new TableTest(new SurveyModel(), [], null, [], false);
  table.columns = [
    {
      name: "column1",
      displayName: "column1",
      dataType: 0,
      visibility: 0,
      location: 0,
    },
    {
      name: "column2",
      displayName: "column2",
      dataType: 0,
      visibility: 0,
      location: 0,
    },
    {
      name: "column3",
      displayName: "column3",
      dataType: 0,
      visibility: 0,
      location: 0,
    },
  ];
  table.moveColumn(0, 1);
  var names = table.columns.map((column) => column.name);
  expect(names).toEqual(["column2", "column1", "column3"]);
  table.moveColumn(0, 2);
  names = table.columns.map((column) => column.name);
  expect(names).toEqual(["column1", "column3", "column2"]);
});

test("check that setPageSize fires onStateChanged", () => {
  var table = new TableTest(new SurveyModel(), [], null, [], false);
  var count = 0;
  table.onStateChanged.add(() => {
    count++;
  });
  table.setPageSize(2);
  expect(count).toBe(1);
});

test("check save/restore page size in the state", () => {
  var table = new TableTest(new SurveyModel(), [], null, [], false);
  table.setPageSize(2);
  expect(table.state.pageSize).toBe(2);
  table.state = { elements: [], locale: "", pageSize: 4 };
  expect(table.getPageSize()).toBe(4);
});

test("check setColumnWidth method", () => {
  var table = new TableTest(new SurveyModel(), [], null, [], false);
  table.columns = [
    {
      name: "column1",
      displayName: "column1",
      dataType: 0,
      visibility: 0,
      location: 0,
    },
  ];
  table.setColumnWidth("column1", 50);
  expect(table.columns[0].width).toBe(50);
});

test("check that setColumnWidth fires onStateChanged", () => {
  var table = new TableTest(new SurveyModel(), [], null, [], false);
  var count = 0;
  table.columns = [
    {
      name: "column1",
      displayName: "column1",
      dataType: 0,
      visibility: 0,
      location: 0,
    },
  ];
  table.onStateChanged.add(() => {
    count++;
  });
  table.setColumnWidth("column1", 50);
  expect(count).toBe(1);
});
