// ObjectId() method for converting studentId string into an ObjectId for querying database
const { ObjectId } = require('mongoose').Types;
const { Student, Course } = require('../models');

// TODO: Create an aggregate function to get the number of students overall
const headCount = async () => {
  // Your code here
 
  try{
    const numberOfStudents = await Student.aggregate([

      
        {
          
          $group:{
            _id: null,
            totalCount: {$count:{}}
          }
        }
    ])
    return numberOfStudents;
  }
  catch(err){
    res.status(500).send(err)
  }

}

// Execute the aggregate method on the Student model and calculate the overall grade by using the $avg operator
const grade = async (studentId) =>
  Student.aggregate([
    // TODO: Ensure we include only the student who can match the given ObjectId using the $match operator
    {
      // Your code here
      $match:{_id: new ObjectId(studentId) }
    },
    {
      $unwind: '$assignments'

    },
    // TODO: Group information for the student with the given ObjectId alongside an overall grade calculated using the $avg operator
    {
      // Your code here
      $group:{
        _id: new ObjectId(studentId),
        overallGrade: {$avg: '$assignments.score'}, 
        sumGrade: {$sum: '$assignments.score'},

        //destructuring the score from the assignments object and calculating the average score for the student 
        count: { $count: {} }
      }
    },
  ]);

module.exports = {
  // Get all students
  async getStudents(req, res) {
    try {
      const students = await Student.find();
      const studentObj = {
        students,
        headCount: await headCount(),
      };
      return res.json(studentObj);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },


  // Get a single student
  async getSingleStudent(req, res) {
    try {
      const student = await Student.findOne({ _id: req.params.studentId })
        .select('-__v')
        .lean();// lean() method is used to convert the mongoose document into a plain JavaScript object 
        // such as JSON object. For example, suppose you have a mongoose document like this: 
        // { _id: 5f1f3b5b4e7b4b1f3c1b4e7b, name: 'John', age: 25 } 
        // and you want to convert it into a plain JavaScript object like this: 
        // { _id: 5f1f3b5b4e7b4b1f3c1b4e7b, name: 'John', age: 25 }, 
        // then you can use the lean method to convert the mongoose document into a plain JavaScript object.
        
        


      if (!student) {
        return res.status(404).json({ message: 'No student with that ID' });
      }

      res.json({
        student,
        grade: await grade(req.params.studentId),
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
  // create a new student
  async createStudent(req, res) {
    try {
      const student = await Student.create(req.body);
      res.json(student);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  // Delete a student and remove them from the course
  async deleteStudent(req, res) {
    try {
      const student = await Student.findOneAndRemove({ _id: req.params.studentId });

      if (!student) {
        return res.status(404).json({ message: 'No such student exists' })
      }

      const course = await Course.findOneAndUpdate(
        { students: req.params.studentId },
        { $pull: { students: req.params.studentId } },
        { new: true }
      );

      if (!course) {
        return res.status(404).json({
          message: 'Student deleted, but no courses found',
        });
      }

      res.json({ message: 'Student successfully deleted' });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  // Add an assignment to a student
  async addAssignment(req, res) {
    try {
      console.log('You are adding an assignment');
      console.log(req.body);
      const student = await Student.findOneAndUpdate(
        { _id: req.params.studentId },
        { $addToSet: { assignments: req.body } },
        { runValidators: true, new: true }
      );

      if (!student) {
        return res
          .status(404)
          .json({ message: 'No student found with that ID :(' })
      }

      res.json(student);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  // Remove assignment from a student
  async removeAssignment(req, res) {
    try {
      const student = await Student.findOneAndUpdate(
        { _id: req.params.studentId },
        { $pull: { assignment: { assignmentId: req.params.assignmentId } } },
        { runValidators: true, new: true }
      );

      if (!student) {
        return res
          .status(404)
          .json({ message: 'No student found with that ID :(' });
      }

      res.json(student);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};
