package com.example.authentication.service.implement;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.authentication.entity.UserEntity;
import com.example.authentication.model.Users;
import com.example.authentication.model.mapper.UserMapper;
import com.example.authentication.repository.UserRepository;
import com.example.authentication.service.interfaces.UserService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(rollbackFor = Exception.class)
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    private final UserRepository userRepository;
    private final UserMapper userMapper; // Injecting UserMapper

    @Override
    public Users createUsers(Users user) {
        logger.info("Creating user: {}", user);
        user.setCreateAt(LocalDateTime.now());
        user.setUpdateAt(LocalDateTime.now());

        // Convert DTO to Entity
        UserEntity userEntity = userMapper.toEntity(user);
        userRepository.save(userEntity);

        // Convert back to DTO for return
        Users createdUser = userMapper.toDTO(userEntity);
        logger.info("User created successfully: {}", createdUser);
        return createdUser;
    }

    @Override
    public boolean deleteUser(Long id) {
        logger.info("Deleting user with ID: {}", id);
        var userEntity = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("User not found with ID: {}", id);
                    return new RuntimeException("User not found with ID: " + id);
                });
        userRepository.delete(userEntity);
        logger.info("User deleted successfully with ID: {}", id);
        return true;
    }

    @Override
    public List<Map<String, String>> getAllUsers() {
        logger.info("Fetching all users");
        List<Map<String, String>> users = userRepository.findAll().stream()
                .map(userEntity -> Map.of("name", userEntity.getUserName()))
                .collect(Collectors.toList());
        logger.info("Retrieved {} users", users.size());
        return users;
    }

    @Override
    public Map<String, String> getUserById(Long id) {
        logger.info("Fetching user with ID: {}", id);
        var userEntity = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("User not found with ID: {}", id);
                    return new RuntimeException("User not found with ID: " + id);
                });

        logger.info("User found: {}", userEntity);
        return Map.of(
                "userName", userEntity.getUserName(),
                "address", userEntity.getAddress(),
                "gender", userEntity.getGender()
        );
    }

    @Override
    public List<Map<String, Object>> getUserByName(String userName) {
        logger.info("Fetching users with name containing: {}", userName);
        List<Map<String, Object>> users = userRepository.findByUserNameContains(userName).stream()
                .map(userEntity -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("userId", userEntity.getUser_id());
                    userMap.put("userName", userEntity.getUserName());
                    return userMap;
                })
                .collect(Collectors.toList());
        logger.info("Found {} users with name containing: {}", users.size(), userName);
        return users;
    }
    
    @Override
    public Map<String, Long> getUserIdByUserName(String userName) {
        logger.info("Fetching user ID by username: {}", userName);
        var userEntity = userRepository.findByUserName(userName)
                .orElseThrow(() -> {
                    logger.error("User not found with username: {}", userName);
                    return new RuntimeException("User not found with username: " + userName);
                });
        logger.info("User found: {}", userEntity);
        return Map.of("user_id", userEntity.getUser_id());
    }

    @Override
    public Users updateUser(Long id, Users user) {
        logger.info("Updating user with ID: {}", id);
        var userEntity = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("User not found with ID: {}", id);
                    return new RuntimeException("User not found with ID: " + id);
                });
        
        userEntity.setAddress(user.getAddress());
        userEntity.setBirth_day(user.getBirth_day());
        userEntity.setGender(user.getGender());
        userEntity.setUpdateAt(LocalDateTime.now());

        // Save updated entity and convert back to DTO
        userRepository.save(userEntity);
        Users updatedUser = userMapper.toDTO(userEntity);

        logger.info("User updated successfully: {}", updatedUser);
        return updatedUser;
    }
}
