import { Clock, Calendar } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

export function Schedule() {
  const [selectedGrade, setSelectedGrade] = useState(1);

  const grades = [1, 2, 3, 4, 5, 6, 7, 8];

  const schedules = {
    1: [
      { time: '8:00 - 8:45', subject: 'English Language Arts', room: '101' },
      { time: '8:50 - 9:35', subject: 'Mathematics', room: '101' },
      { time: '9:35 - 9:50', subject: 'Recess', room: 'Playground' },
      { time: '9:50 - 10:35', subject: 'Science', room: '101' },
      { time: '10:40 - 11:25', subject: 'Social Studies', room: '101' },
      { time: '11:25 - 12:10', subject: 'Lunch', room: 'Cafeteria' },
      { time: '12:15 - 1:00', subject: 'Art / Music (alternate days)', room: '201/202' },
      { time: '1:05 - 1:50', subject: 'Physical Education', room: 'Gymnasium' },
      { time: '1:55 - 2:30', subject: 'Reading Time', room: '101' },
    ],
    2: [
      { time: '8:00 - 8:45', subject: 'Mathematics', room: '102' },
      { time: '8:50 - 9:35', subject: 'English Language Arts', room: '102' },
      { time: '9:35 - 9:50', subject: 'Recess', room: 'Playground' },
      { time: '9:50 - 10:35', subject: 'Social Studies', room: '102' },
      { time: '10:40 - 11:25', subject: 'Science', room: '102' },
      { time: '11:25 - 12:10', subject: 'Lunch', room: 'Cafeteria' },
      { time: '12:15 - 1:00', subject: 'Physical Education', room: 'Gymnasium' },
      { time: '1:05 - 1:50', subject: 'Art / Music (alternate days)', room: '201/202' },
      { time: '1:55 - 2:30', subject: 'Library Time', room: 'Library' },
    ],
    3: [
      { time: '8:00 - 8:50', subject: 'English Language Arts', room: '103' },
      { time: '8:55 - 9:45', subject: 'Mathematics', room: '103' },
      { time: '9:45 - 10:00', subject: 'Recess', room: 'Playground' },
      { time: '10:00 - 10:50', subject: 'Science', room: '103' },
      { time: '10:55 - 11:45', subject: 'Social Studies', room: '103' },
      { time: '11:45 - 12:30', subject: 'Lunch', room: 'Cafeteria' },
      { time: '12:35 - 1:25', subject: 'Art / Music (alternate days)', room: '201/202' },
      { time: '1:30 - 2:20', subject: 'Physical Education', room: 'Gymnasium' },
      { time: '2:25 - 3:00', subject: 'Computer Lab', room: '301' },
    ],
    4: [
      { time: '8:00 - 8:50', subject: 'Mathematics', room: '104' },
      { time: '8:55 - 9:45', subject: 'English Language Arts', room: '104' },
      { time: '9:45 - 10:00', subject: 'Recess', room: 'Playground' },
      { time: '10:00 - 10:50', subject: 'Social Studies', room: '104' },
      { time: '10:55 - 11:45', subject: 'Science', room: '104' },
      { time: '11:45 - 12:30', subject: 'Lunch', room: 'Cafeteria' },
      { time: '12:35 - 1:25', subject: 'Physical Education', room: 'Gymnasium' },
      { time: '1:30 - 2:20', subject: 'Art / Music (alternate days)', room: '201/202' },
      { time: '2:25 - 3:00', subject: 'Computer Lab', room: '301' },
    ],
    5: [
      { time: '8:00 - 8:55', subject: 'English Language Arts', room: '201' },
      { time: '9:00 - 9:55', subject: 'Mathematics', room: '201' },
      { time: '9:55 - 10:10', subject: 'Recess', room: 'Playground' },
      { time: '10:10 - 11:05', subject: 'Science', room: 'Lab 1' },
      { time: '11:10 - 12:05', subject: 'Social Studies', room: '201' },
      { time: '12:05 - 12:50', subject: 'Lunch', room: 'Cafeteria' },
      { time: '12:55 - 1:50', subject: 'Elective (Art/Music/Tech)', room: 'Various' },
      { time: '1:55 - 2:50', subject: 'Physical Education', room: 'Gymnasium' },
      { time: '2:55 - 3:15', subject: 'Homeroom / Study Hall', room: '201' },
    ],
    6: [
      { time: '8:00 - 8:55', subject: 'Mathematics', room: '202' },
      { time: '9:00 - 9:55', subject: 'English Language Arts', room: '202' },
      { time: '9:55 - 10:10', subject: 'Break', room: '-' },
      { time: '10:10 - 11:05', subject: 'Social Studies', room: '202' },
      { time: '11:10 - 12:05', subject: 'Science', room: 'Lab 2' },
      { time: '12:05 - 12:50', subject: 'Lunch', room: 'Cafeteria' },
      { time: '12:55 - 1:50', subject: 'Physical Education', room: 'Gymnasium' },
      { time: '1:55 - 2:50', subject: 'Elective (Art/Music/Tech)', room: 'Various' },
      { time: '2:55 - 3:15', subject: 'Advisory Period', room: '202' },
    ],
    7: [
      { time: '8:00 - 8:55', subject: 'English Language Arts', room: '203' },
      { time: '9:00 - 9:55', subject: 'Mathematics (Pre-Algebra)', room: '203' },
      { time: '9:55 - 10:10', subject: 'Break', room: '-' },
      { time: '10:10 - 11:05', subject: 'Science (Biology)', room: 'Lab 1' },
      { time: '11:10 - 12:05', subject: 'Social Studies (History)', room: '203' },
      { time: '12:05 - 12:50', subject: 'Lunch', room: 'Cafeteria' },
      { time: '12:55 - 1:50', subject: 'Elective (Art/Music/Tech)', room: 'Various' },
      { time: '1:55 - 2:50', subject: 'Physical Education', room: 'Gymnasium' },
      { time: '2:55 - 3:15', subject: 'Study Hall', room: '203' },
    ],
    8: [
      { time: '8:00 - 8:55', subject: 'Mathematics (Algebra)', room: '204' },
      { time: '9:00 - 9:55', subject: 'English Language Arts', room: '204' },
      { time: '9:55 - 10:10', subject: 'Break', room: '-' },
      { time: '10:10 - 11:05', subject: 'Science (Physical Science)', room: 'Lab 2' },
      { time: '11:10 - 12:05', subject: 'Social Studies (Civics)', room: '204' },
      { time: '12:05 - 12:50', subject: 'Lunch', room: 'Cafeteria' },
      { time: '12:55 - 1:50', subject: 'Physical Education', room: 'Gymnasium' },
      { time: '1:55 - 2:50', subject: 'Elective (Art/Music/Tech)', room: 'Various' },
      { time: '2:55 - 3:15', subject: 'College Prep / Advisory', room: '204' },
    ],
  };

  const bellSchedule = [
    { time: '8:00 AM', event: 'School Starts' },
    { time: '9:35 AM', event: 'Morning Recess (Grades 1-2)' },
    { time: '9:45 AM', event: 'Morning Break (Grades 3-4)' },
    { time: '9:55 AM', event: 'Morning Break (Grades 5-8)' },
    { time: '11:25 AM - 12:30 PM', event: 'Lunch Periods (Staggered)' },
    { time: '2:30 PM', event: 'School Dismissal (Grades 1-2)' },
    { time: '3:00 PM', event: 'School Dismissal (Grades 3-4)' },
    { time: '3:15 PM', event: 'School Dismissal (Grades 5-8)' },
  ];

  return (
    <div>
      {/* Page header */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12 md:py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4"
        >
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl md:text-4xl font-bold mb-4">Class Schedules</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="text-lg text-blue-100 max-w-3xl">
            View daily class schedules for each grade level and important school timings.
          </motion.p>
        </motion.div>
      </section>

      {/* Grade selector */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="size-6 text-blue-700" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Select Grade Level</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {grades.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedGrade === grade
                    ? 'bg-blue-700 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Grade {grade}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule table */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-700 text-white px-6 py-4">
              <h3 className="text-xl md:text-2xl font-bold">
                Grade {selectedGrade} Daily Schedule
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Time</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Subject</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Room</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules[selectedGrade as keyof typeof schedules].map((item, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-200 ${
                        item.subject === 'Lunch' || item.subject === 'Recess' || item.subject === 'Break'
                          ? 'bg-green-50'
                          : index % 2 === 0
                          ? 'bg-white'
                          : 'bg-gray-50'
                      } hover:bg-blue-50 transition-colors`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-700 font-semibold">
                        {item.time}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">{item.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Bell schedule */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-green-100 p-3 rounded-lg">
              <Clock className="size-6 text-green-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Daily Bell Schedule</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bellSchedule.map((bell, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-green-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <p className="text-blue-700 font-bold text-lg mb-2">{bell.time}</p>
                <p className="text-gray-700">{bell.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important notes */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Important Schedule Notes</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>Schedules are subject to change on special event days and holidays</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>Early dismissal days occur on the first Friday of each month at 1:00 PM</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>Elective classes rotate between Art, Music, and Technology throughout the week</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>After-school activities run from 3:30 PM to 5:00 PM Monday through Friday</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
