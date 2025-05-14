/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  modulePathIgnorePatterns: ["dist/"],
  coveragePathIgnorePatterns: ["node_modules/", "dist/"],
  coverageReporters: ["text", "html"],
};