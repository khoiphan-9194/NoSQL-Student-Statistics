const connection = require('../config/connection');
const { Course, Student } = require('../models');
const { getRandomName, getRandomAssignments } = require('./data');

// this line of code is used to connect to the database and log an error if there is one 
connection.on('error', (err) => err);

connection.once('open', async () => {
  console.log('connected');
    // Delete the collections if they exist
    //
    let courseCheck = await connection.db.listCollections({ name: 'courses' }).toArray(); // check if the collection exists in the database 
    if (courseCheck.length) {
      await connection.dropCollection('courses');
    }

    let studentsCheck = await connection.db.listCollections({ name: 'students' }).toArray();
    if (studentsCheck.length) {
      await connection.dropCollection('students');
    }
  // Create empty array to hold the students
  const students = [];

  // Loop 20 times -- add students to the students array
  for (let i = 0; i < 20; i++) {
    // Get some random assignment objects using a helper function that we imported from ./data
    const assignments = getRandomAssignments(20);

    const fullName = getRandomName();
    const first = fullName.split(' ')[0];
    const last = fullName.split(' ')[1];
    const github = `${first}${Math.floor(Math.random() * (99 - 18 + 1) + 18)}`;
    console.log(github);

    students.push({
      first,
      last,
      github,
      assignments,
    });
  }

  // Add students to the collection and await the results
  const studentData = await Student.create(students);

  // Add courses to the collection and await the results
  await Course.create({
    courseName: 'UCLA',
    inPerson: false,
    
    // this line of code is used to get the id of the student and add it to the course,
    // map will loop through the studentData array and get the id of each student and add it to the students array 
    students: [...studentData.map(({_id}) => _id)],
  });
  // in insomina, we can create a new course and add the students to the course like this:
//   {  
//     "courseName": "San Jose State",
//     "inPerson": false,
//     "students": [
//         "60e9e5f2b7d1b1f5d7e5c3c4",
//        "60e9e5f2b7d1b1f5d7e5c3c5",
//        "60e9e5f2b7d1b1f5d7e5c3c6"
//     ]
//  }

  // Log out the seed data to indicate what should appear in the database
  console.table(students);
  console.info('Seeding complete! 🌱');
  process.exit(0);
});
