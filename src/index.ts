import inquirer from "inquirer";
import { pool, connectToDb } from "./connection.js";
await connectToDb();

async function getEmployeeChoices() {
  const results = await pool.query("SELECT * FROM employee");

  const employees = results.rows;

  const choices = employees.map((employee) => {
    return {
      name: employee.first_name + " " + employee.last_name,
      value: employee.id,
    };
  });

  return choices;
}

async function getRoleChoices() {
  const results = await pool.query("SELECT * FROM role");

  const roles = results.rows;

  const choices = roles.map((role) => {
    return {
      name: role.title,
      value: role.id,
    };
  });

  return choices;
}

async function getDepartmentChoices() {
  const results = await pool.query("SELECT * FROM department");

  const departments = results.rows;

  const choices = departments.map((department) => {
    return {
      name: department.name,
      value: department.id,
    };
  });

  return choices;
}
// async function getManagerChoices() {
//   const results = await pool.query("SELECT * FROM employee");

//   const managers = results.rows;

//   const choices = managers.map((employee) => {
//     return {
//       name: employee.name,
//       value: employee.id,
//     };
//   });

//   return choices;
// }

async function mainMenu() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "view all roles",
          "view all departments",
          "view all employees",
          "add a department",
          "add a role",
          "add an employee",
          "update an employee role",
          "Quit",
        ],
      },
    ])
    .then(async ({ action }) => {
      if (action === "view all roles") {
        pool.query("SELECT * FROM role").then((results) => {
          const roles = results.rows;
          console.table(roles);
          mainMenu();
        });
      }
      if (action === "view all departments") {
        pool.query("SELECT * FROM department").then((results) => {
          const departments = results.rows;
          console.table(departments);
          mainMenu();
        });
      }
      if (action === "view all employees") {
        pool.query("SELECT * FROM employee").then((results) => {
          const employees = results.rows;
          console.table(employees);
          mainMenu();
        });
      }
      if (action === "add a department") {
        inquirer
          .prompt([
            {
              type: "input",
              name: "dept_name",
              message: "What is the name of the new department?",
            },
          ])
          .then(({ dept_name }) => {
            pool
              .query("INSERT INTO department(name) VALUES ($1)", [dept_name])
              .then(() => {
                console.log(`Department ${dept_name} has been added!`);
                mainMenu();
              });
          });
      }
      if (action === "add a role") {
        inquirer
          .prompt([
            {
              type: "input",
              name: "role_title",
              message: "What role would you like to add?",
            },
            {
              type: "input",
              name: "role_salary",
              message: "What is the salary for this role?",
            },
            {
              type: "list",
              name: "role_dept",
              message: "What department is this role for?",
              choices: await getDepartmentChoices(),
            },
          ])
          .then(({ role_title, role_salary, role_dept }) => {
            pool
              .query(
                "INSERT INTO role(title, salary, department_id) VALUES ($1, $2, $3)",
                [role_title, role_salary, role_dept]
              )
              .then(() => {
                console.log(`${role_title} has been added!`);
                mainMenu();
              });
          });
      }
      if (action === "add an employee") {
        inquirer
          .prompt([
            {
              type: "input",
              name: "emp_first_name",
              message: "What is the employees first name?",
            },
            {
              type: "input",
              name: "emp_last_name",
              message: "What is the employees last name?",
            },
            {
              type: "list",
              name: "emp_role",
              message: "What is the role for this employee?",
              choices: await getRoleChoices(),
            },
            {
              type: "list",
              name: "manager_id",
              message: "Who is the manager for this employee?",
              choices: await getEmployeeChoices(),
            },
          ])
          .then(({ emp_first_name, emp_last_name, emp_role, manager_id }) => {
            pool
              .query(
                "INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
                [emp_first_name, emp_last_name, emp_role, manager_id]
              )

              .then(() => {
                console.log(
                  `${emp_first_name} ${emp_last_name} has been added!`
                );
                //inquirer.prompt with q what is employees role, give choices. question for who is the employees manager, construct employee object, add manager id to emp object, emp object gets inserted into db with the manager_id key added
                // inquirer.prompt([
                //   {
                //     type: "list",
                //     name: "emp_role",
                //     message: "What is the role for this employee",
                //     choices: await getRoleChoices(),
                //   },
                // ]);
                mainMenu();
              });
          });
      }
      if (action === "update an employee role") {
        inquirer
          .prompt([
            {
              type: "list",
              name: "emp_id",
              // message: "What is the id of the employee that you want to update?",
              message: "Which employee do you want to update",
              choices: await getEmployeeChoices(),
            },
            {
              type: "list",
              name: "role_id",
              message:
                "What is the id of the role that you want to assign to the selected employee?",
              choices: await getRoleChoices(),
            },
          ])
          .then(({ emp_id, role_id }) => {
            pool
              .query("UPDATE employee SET role_id = $1 WHERE id = $2", [
                role_id,
                emp_id,
              ])
              .then(() => {
                console.log(`Employee has been updated`);
                mainMenu();
              });
          });
      }
      if (action === "Quit") {
        process.exit(1);
      }
    });
}

mainMenu();
