import asyncHandler from "express-async-handler";
import Role from "../models/Role.js";

/**
 * @DESC Get all roles data
 * @ROUTE /api/v1/role
 * @method GET
 * @access public
 */
export const getAllRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find();

  if (roles.length > 0) {
    res.status(200).json(roles);
  } else {
    res.status(404).json({ message: "No roles found" });
  }
});

/**
 * @DESC Get Single role data
 * @ROUTE /api/v1/role/:id
 * @method GET
 * @access public
 */
export const getSingleRole = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const role = await Role.findById(id);

  if (!role) {
    return res.status(404).json({ message: "Role not found" });
  }

  res.status(200).json(role);
});

/**
 * @DESC Create new role
 * @ROUTE /api/v1/role
 * @method POST
 * @access public
 */
export const createRole = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Role name is required" });
  }

  // Check if the role name already exists
  const roleExists = await Role.findOne({ name });

  if (roleExists) {
    return res.status(400).json({ message: "Role name already exists" });
  }

  const role = await Role.create({
    name,
  });

  res.status(201).json({ role, message: "Role created successfully" });
});

/**
 * @DESC Delete role
 * @ROUTE /api/v1/role/:id
 * @method DELETE
 * @access public
 */
export const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const role = await Role.findByIdAndDelete(id);

  if (!role) {
    return res.status(404).json({ message: "Role not found" });
  }

  res.status(200).json({ message: "Role deleted successfully" });
});

/**
 * @DESC Update role
 * @ROUTE /api/v1/role/:id
 * @method PUT/PATCH
 * @access public
 */
export const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;

  const role = await Role.findByIdAndUpdate(
    id,
    {
      name,
      status,
    },
    { new: true }
  );

  if (!role) {
    return res.status(404).json({ message: "Role not found" });
  }

  res.status(200).json({ role, message: "Role updated successfully" });
});
