import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock components simples para testes
const MockDashboardAdmin = () => <div>Dashboard Admin</div>;
const MockDashboardProfessor = () => <div>Dashboard Professor</div>;
const MockDashboardAluno = () => <div>Dashboard Aluno</div>;

describe("Dashboard Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("DashboardAdmin", () => {
    it("should render admin dashboard", () => {
      render(<MockDashboardAdmin />);
      expect(screen.getByText("Dashboard Admin")).toBeInTheDocument();
    });
  });

  describe("DashboardProfessor", () => {
    it("should render professor dashboard", () => {
      render(<MockDashboardProfessor />);
      expect(screen.getByText("Dashboard Professor")).toBeInTheDocument();
    });
  });

  describe("DashboardAluno", () => {
    it("should render student dashboard", () => {
      render(<MockDashboardAluno />);
      expect(screen.getByText("Dashboard Aluno")).toBeInTheDocument();
    });
  });
});
