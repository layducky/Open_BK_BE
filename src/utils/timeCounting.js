
const scheduleExpiration = (submissionId, testDuration, createdAt) => {
  const timeToDeadline = createdAt.getTime() + testDuration * 1000 - Date.now();
  setTimeout(async () => {
    await Submission.findByIdAndUpdate(submissionId, { status: 'expired' });
  }, timeToDeadline);
};